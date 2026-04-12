/**
 * AutoAssignmentService.ts
 * 
 * Rules engine to convert crawler issues into tasks automatically.
 */

import { turso, initializeDatabase, isCloudSyncEnabled } from './turso';
import { crawlDb } from './CrawlDatabase';
import { createTask, getTasks, updateTask } from './TaskService';
import { logActivity, createNotification } from './ActivityService';
import { getCategoryOwners, getMembers } from './TeamService';
import type { AssignmentRule, TriggerType, AssignmentStrategy, CrawlTask } from './app-types';

let schemaReady: Promise<void> | null = null;

const ensureSchema = async () => {
    if (!schemaReady) {
        schemaReady = initializeDatabase().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    await schemaReady;
};

/**
 * Fetch rules for a project
 */
export async function getRules(projectId: string): Promise<AssignmentRule[]> {
    if (isCloudSyncEnabled) {
        try {
            await ensureSchema();
            const result = await turso().execute({
                sql: `SELECT * FROM assignment_rules WHERE project_id = ?`,
                args: [projectId]
            });
            const rules = result.rows.map(mapRowToRule);
            
            await crawlDb.rules.where('projectId').equals(projectId).delete();
            await crawlDb.rules.bulkPut(rules);
            
            return rules;
        } catch (error) {
            console.error('[AutoAssignmentService] Failed to fetch rules from cloud:', error);
        }
    }
    return crawlDb.rules.where('projectId').equals(projectId).toArray();
}

/**
 * Create a new rule
 */
export async function createRule(
    projectId: string,
    data: Omit<AssignmentRule, 'id' | 'project_id' | 'created_at'>
): Promise<AssignmentRule> {
    const rule: AssignmentRule = {
        id: crypto.randomUUID(),
        project_id: projectId,
        ...data,
        created_at: new Date().toISOString()
    };

    await crawlDb.rules.put(rule);

    if (isCloudSyncEnabled) {
        try {
            await ensureSchema();
            await turso().execute({
                sql: `INSERT INTO assignment_rules (id, project_id, rule_name, trigger_type, trigger_condition_json, action_type, assignee_id, assignee_strategy, priority_override, enabled, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    rule.id, rule.project_id, rule.rule_name, rule.trigger_type,
                    rule.trigger_condition_json, rule.action_type, rule.assignee_id,
                    rule.assignee_strategy, rule.priority_override, 
                    rule.enabled ? 1 : 0, rule.created_at
                ]
            });
        } catch (error) {
            console.error('[AutoAssignmentService] Failed to sync rule to cloud:', error);
        }
    }

    return rule;
}

/**
 * Seed default assignment rules for a new project
 */
export async function seedDefaultRules(projectId: string): Promise<void> {
    const existingRules = await getRules(projectId);
    if (existingRules.length > 0) return;

    const defaultRules: Array<Omit<AssignmentRule, 'id' | 'project_id' | 'created_at'>> = [
        {
            rule_name: "Auto-create tasks for critical issues",
            trigger_type: "issue_severity",
            trigger_condition_json: JSON.stringify({ severity: ["Critical"], minAffectedPages: 1 }),
            action_type: "create_task",
            assignee_strategy: "project_owner",
            priority_override: "high",
            enabled: true,
            assignee_id: null
        },
        {
            rule_name: "Auto-create tasks for high-impact warnings",
            trigger_type: "issue_severity",
            trigger_condition_json: JSON.stringify({ severity: ["High"], minAffectedPages: 5 }),
            action_type: "create_task",
            assignee_strategy: "project_owner",
            priority_override: "medium",
            enabled: true,
            assignee_id: null
        },
        {
            rule_name: "Auto-create tasks for performance issues",
            trigger_type: "issue_category",
            trigger_condition_json: JSON.stringify({ categories: ["performance", "security"], severity: ["Critical", "High"] }),
            action_type: "create_task",
            assignee_strategy: "project_owner",
            priority_override: "high",
            enabled: true,
            assignee_id: null
        }
    ];

    for (const ruleData of defaultRules) {
        await createRule(projectId, ruleData);
    }
}

/**
 * Execute rules on a set of issues (usually after a crawl)
 */
export async function executeRules(
    projectId: string,
    sessionId: string,
    issues: any[] // issues from IssueCluster
): Promise<any[]> {
    const rules = await getRules(projectId);
    const enabledRules = rules.filter(r => r.enabled);
    if (enabledRules.length === 0) return [];

    const existingTasks = await getTasks(projectId);
    const createdTasks = [];

    for (const issue of issues) {
        for (const rule of enabledRules) {
            if (isMatch(rule, issue)) {
                // Check if task already exists for this issue
                const alreadyExists = existingTasks.find(t => t.linked_issue_id === issue.id);
                if (alreadyExists) continue;

                // Determine assignee
                const assignee = await determineAssignee(projectId, rule, issue);

                const task = await createTask(projectId, {
                    sessionId,
                    title: issue.title,
                    description: issue.description,
                    priority: (rule.priority_override as any) || issue.priority,
                    category: issue.category,
                    source: 'crawler',
                    linkedIssueId: issue.id,
                    affectedUrls: JSON.parse(issue.affected_urls_json || '[]'),
                    assigneeId: assignee?.id,
                    assigneeName: assignee?.name,
                    assigneeAvatar: assignee?.avatar_url,
                    dueDate: estimateDueDate(
                        (rule.priority_override || issue.priority),
                        issue.effort || 'medium'
                    ),
                    createdBy: 'system'
                });
                createdTasks.push(task);
                break; // One rule per issue
            }
        }
    }

    return createdTasks;
}

// Calculate estimated due date based on effort + priority
function estimateDueDate(priority: string, effort: string): string {
    const now = new Date();
    let daysToAdd = 7; // default: 1 week

    const lowPriority = priority.toLowerCase();
    const lowEffort = effort.toLowerCase();

    // Effort-based baseline
    if (lowEffort === 'low' || lowEffort === 'easy') daysToAdd = 3;
    else if (lowEffort === 'medium') daysToAdd = 7;
    else if (lowEffort === 'high' || lowEffort === 'hard') daysToAdd = 14;

    // Priority multiplier
    if (lowPriority === 'critical' || lowPriority === 'high') {
        daysToAdd = Math.max(1, Math.ceil(daysToAdd * 0.5)); // halve for urgent
    } else if (lowPriority === 'low') {
        daysToAdd = Math.ceil(daysToAdd * 1.5); // more buffer for low priority
    }

    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function isMatch(rule: AssignmentRule, issue: any): boolean {
    try {
        const condition = JSON.parse(rule.trigger_condition_json || '{}');
        const issuePriority = (issue.priority || '').toLowerCase();
        const issueCategory = (issue.category || '').toLowerCase();
        const affectedCount = issue.count || (issue.affected_urls_json ? JSON.parse(issue.affected_urls_json).length : 0);

        switch (rule.trigger_type) {
            case 'issue_severity': {
                // Check severity (single string or array)
                const severeEnough = Array.isArray(condition.severity) 
                    ? condition.severity.map((s: string) => s.toLowerCase()).includes(issuePriority)
                    : issuePriority === (condition.severity || '').toLowerCase();
                
                // Check minimum affected pages
                const minAffected = condition.minAffectedPages || 1;
                return severeEnough && affectedCount >= minAffected;
            }
            case 'issue_category': {
                // Check category (single string or array)
                const categoryMatch = Array.isArray(condition.categories)
                    ? condition.categories.map((c: string) => c.toLowerCase()).includes(issueCategory)
                    : issueCategory === (condition.category || '').toLowerCase();
                
                // Check severity (single string or array)
                const severityMatch = condition.severity 
                    ? (Array.isArray(condition.severity)
                        ? condition.severity.map((s: string) => s.toLowerCase()).includes(issuePriority)
                        : issuePriority === (condition.severity || '').toLowerCase())
                    : true; // If severity not specified, match all in category
                
                return categoryMatch && severityMatch;
            }
            default:
                return false;
        }
    } catch (e) {
        console.error('[AutoAssignmentService] Failed to parse rule condition:', e);
        return false;
    }
}


async function determineAssignee(projectId: string, rule: AssignmentRule, issue: any) {
    if (rule.assignee_strategy === 'specific') {
        // We'd need to fetch the specific user details or just return the ID
        return { id: rule.assignee_id, name: null, avatar_url: null };
    }
    
    if (rule.assignee_strategy === 'category_owner') {
        const owners = await getCategoryOwners(projectId);
        // Simple logic: pick first owner for now, or match by name/skill if we had that
        return owners[0] || null;
    }

    if (rule.assignee_strategy === 'round_robin') {
        const members = await getCategoryOwners(projectId);
        if (members.length === 0) return null;
        // Deterministic round-robin based on issue ID hash
        const index = Math.abs(hashCode(issue.id)) % members.length;
        return members[index];
    }

    return null;
}

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}

/**
 * Reconcile tasks with current issues (Auto-resolve if fixed, reopen if reappeared)
 */
export async function reconcileTasksWithIssues(
    projectId: string,
    currentRunId: string
): Promise<{ resolved: number; reopened: number }> {
    const tasks = await getTasks(projectId);
    const crawlerTasks = tasks.filter(t => t.source === 'crawler' && t.linked_issue_id);
    
    // Get current issues
    const result = await turso().execute({
        sql: `SELECT id, title FROM crawl_issue_clusters WHERE run_id = ?`,
        args: [currentRunId]
    });
    
    const currentIssueTitles = new Set(result.rows.map(r => String(r.title).toLowerCase()));
    
    let resolved = 0;
    let reopened = 0;

    // Find project owner for notifications
    const members = await getMembers(projectId);
    const owner = members.find(m => m.role === 'owner') || members[0];

    for (const task of crawlerTasks) {
        const taskTitle = task.title.toLowerCase();
        
        if (task.status !== 'done') {
            // Check if issue still exists
            const stillExists = currentIssueTitles.has(taskTitle);
            if (!stillExists) {
                // Auto-resolve
                await updateTask(task.id, { status: 'done', completed_at: new Date().toISOString() });
                
                await logActivity(projectId, {
                    actorId: 'system',
                    action: 'task_resolved',
                    entityType: 'task',
                    entityId: task.id,
                    metadata: { reason: "Issue fixed in latest crawl" }
                });

                if (owner?.user_id) {
                    await createNotification(projectId, owner.user_id, {
                        type: 'crawl_complete',
                        title: "Issue resolved: " + task.title,
                        body: `Task auto-resolved: issue fixed in latest crawl.`,
                        entityType: 'task',
                        entityId: task.id
                    });
                }
                resolved++;
            }
        } else {
            // Check if issue reappeared
            const reappeared = currentIssueTitles.has(taskTitle);
            if (reappeared) {
                // Reopen
                await updateTask(task.id, { status: 'todo', completed_at: null });
                
                await logActivity(projectId, {
                    actorId: 'system',
                    action: 'task_reopened',
                    entityType: 'task',
                    entityId: task.id,
                    metadata: { reason: "Issue reappeared in latest crawl" }
                });

                if (owner?.user_id) {
                    await createNotification(projectId, owner.user_id, {
                        type: 'task_assigned',
                        title: "Issue reappeared: " + task.title,
                        body: `Task reopened: issue detected again in latest crawl.`,
                        entityType: 'task',
                        entityId: task.id
                    });
                }
                reopened++;
            }
        }
    }

    return { resolved, reopened };
}

// ─── Row mapper ─────────────────────────────────────────────

function mapRowToRule(row: any): AssignmentRule {
    return {
        id: String(row.id),
        project_id: String(row.project_id),
        rule_name: String(row.rule_name),
        trigger_type: row.trigger_type as TriggerType,
        trigger_condition_json: String(row.trigger_condition_json),
        action_type: row.action_type as AssignmentRule['action_type'],
        assignee_id: row.assignee_id ? String(row.assignee_id) : null,
        assignee_strategy: row.assignee_strategy as AssignmentStrategy,
        priority_override: row.priority_override ? String(row.priority_override) : null,
        enabled: Boolean(row.enabled),
        created_at: String(row.created_at)
    };
}
