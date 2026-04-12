/**
 * IssueFixerAgent.js
 * After crawl completes, auto-generate fix suggestions and create tasks for critical issues
 */

import { randomUUID } from 'crypto';
import { notifyProjectWebhooks } from '../phaseEApi.js';

export const IssueFixerAgent = {
    id: 'issue-fixer',
    name: 'Issue Fixer',
    trigger: 'event',
    event: 'crawl.completed',
    cooldownMs: 0, // Runs every time a crawl completes

    execute: async (context) => {
        const { projectId, turso, aiComplete } = context;
        
        // 1. Load latest crawl run ID for this project
        const runRes = await turso.execute({
            sql: 'SELECT id FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 1',
            args: [projectId]
        });
        
        if (runRes.rows.length === 0) {
            return { status: 'partial', summary: 'No crawl runs found for project' };
        }
        
        const runId = String(runRes.rows[0].id);

        // 2. Load critical/high issues from this run
        const issuesRes = await turso.execute({
            sql: `SELECT * FROM crawl_issue_clusters 
                  WHERE run_id = ? AND (priority = 'critical' OR priority = 'high')
                  ORDER BY score_impact DESC LIMIT 10`,
            args: [runId]
        });
        
        const issues = issuesRes.rows;
        if (issues.length === 0) {
            return { status: 'success', summary: 'No critical or high issues found. Great job!', findings: [] };
        }

        let tasksCreated = 0;
        const findings = [];

        // 3. Process issues in batches to generate AI fixes
        for (const issue of issues) {
            // Check if task already exists for this issue
            const existsRes = await turso.execute({
                sql: 'SELECT id FROM crawl_tasks WHERE project_id = ? AND linked_issue_id = ?',
                args: [projectId, issue.id]
            });
            
            if (existsRes.rows.length > 0) continue;

            // Build AI prompt for fix generation
            const affectedUrls = JSON.parse(String(issue.affected_urls_json || '[]')).slice(0, 3);
            const prompt = `
                Generate a technical fix for the following SEO issue:
                Title: ${issue.title}
                Category: ${issue.category}
                Description: ${issue.description}
                Priority: ${issue.priority}
                Affected URLs: ${affectedUrls.join(', ')}

                Provide:
                1. A brief explanation of the impact.
                2. Precise fix code or instructions (HTML tags, .htaccess, header changes, etc.)
                3. Effort level (Low/Medium/High)
                
                Format as JSON: { "impact": "", "fixCode": "", "effort": "", "explanation": "" }
            `;

            const aiRes = await aiComplete({ prompt, format: 'json' }, turso);
            let aiFix = {};
            try {
                aiFix = JSON.parse(aiRes.text);
            } catch (err) {
                console.error(`[IssueFixerAgent] Failed to parse AI fix for ${issue.id}:`, err);
                continue;
            }

            // 4. Create task
            const taskId = randomUUID();
            const description = `
                **AI Generated Fix Suggestion**
                
                **Impact:** ${aiFix.impact || 'Serious SEO impact.'}
                
                **Recommended Fix:**
                \`\`\`
                ${aiFix.fixCode || 'Follow standard SEO guidelines for this issue.'}
                \`\`\`
                
                **Explanation:** ${aiFix.explanation || issue.description}
                
                **Effort:** ${aiFix.effort || issue.effort || 'Medium'}
                **Source:** Linked from Issue ID ${issue.id}
            `.trim();

            await turso.execute({
                sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, linked_issue_id, affected_urls_json, 
                    created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                args: [
                    taskId,
                    projectId,
                    `Fix: ${issue.title}`,
                    description,
                    'todo',
                    String(issue.priority).toLowerCase(),
                    String(issue.category).toLowerCase(),
                    'agent:issue-fixer',
                    String(issue.id),
                    issue.affected_urls_json,
                    'ai-agent'
                ]
            });

            tasksCreated++;
            findings.push({
                type: 'task_created',
                title: `Task created for: ${issue.title}`,
                body: `Generated technical fix with ${aiFix.effort} effort.`,
                severity: String(issue.priority).toLowerCase(),
                data: { taskId, issueId: issue.id }
            });
        }

        // 5. Notify webhooks
        if (tasksCreated > 0) {
            notifyProjectWebhooks(turso, projectId, 'agent.issue_fixer.completed', {
                projectId,
                tasksCreated,
                runId,
                topFindings: findings.slice(0, 3)
            }).catch(console.error);
        }

        return {
            status: 'success',
            summary: `Processed ${issues.length} issues and created ${tasksCreated} new fix tasks.`,
            findings,
            tasksCreated,
            alertsSent: tasksCreated > 0 ? 1 : 0
        };
    }
};
