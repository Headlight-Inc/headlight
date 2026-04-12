import { randomUUID } from 'crypto';

/**
 * AgentFramework.js
 * Shared runtime for all agents — scheduling, state, execution, logging
 */

/**
 * Interface/Type definitions (for documentation)
 * 
 * AgentDefinition:
 * - id: string (e.g. 'content-monitor')
 * - name: string
 * - trigger: 'cron' | 'event'
 * - schedule: string (e.g. 'weekly', 'daily', '0 2 * * 1')
 * - cooldownMs: number (minimum time between runs)
 * - execute: async (context) => AgentRunResult
 * 
 * AgentContext:
 * - projectId: string
 * - turso: TursoClient
 * - aiComplete: function
 * - aiBatch: function
 * - previousRun: { id, timestamp, resultJson } | null
 * - config: Record<string, any>
 * 
 * AgentRunResult:
 * - status: 'success' | 'partial' | 'error'
 * - summary: string
 * - findings: Array<{ type, title, body, severity, data }>
 * - tasksCreated: number
 * - alertsSent: number
 * - nextRunHint?: string
 */

/**
 * Initializes agent-related tables in Turso
 */
export async function initializeAgentModels(turso) {
    try {
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS agent_runs (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                status TEXT NOT NULL,
                summary TEXT,
                result_json TEXT,
                findings_count INTEGER DEFAULT 0,
                tasks_created INTEGER DEFAULT 0,
                alerts_sent INTEGER DEFAULT 0,
                started_at TEXT NOT NULL,
                completed_at TEXT,
                duration_ms INTEGER
            );
        `);
        
        await turso.execute(`
            CREATE INDEX IF NOT EXISTS idx_agent_runs_project ON agent_runs(project_id, agent_id, started_at DESC);
        `);

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS agent_config (
                project_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                config_json TEXT DEFAULT '{}',
                PRIMARY KEY (project_id, agent_id)
            );
        `);

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS competitors (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                keywords_count INTEGER DEFAULT 0,
                domain_authority INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
        `);
        console.log('[AgentFramework] Tables initialized');
    } catch (err) {
        console.error('[AgentFramework] Migration error:', err);
    }
}

/**
 * Executes a single agent for a project
 */
export async function executeAgent(agentDef, projectId, turso, aiComplete, aiBatch) {
    const startedAt = new Date().toISOString();
    const runId = randomUUID();
    
    console.log(`[Agent:${agentDef.id}] Starting for project ${projectId}`);

    try {
        // Load config from DB
        const configRes = await turso.execute({
            sql: 'SELECT config_json, enabled FROM agent_config WHERE project_id = ? AND agent_id = ?',
            args: [projectId, agentDef.id]
        });
        
        const isEnabled = configRes.rows.length > 0 ? Boolean(configRes.rows[0].enabled) : true;
        if (!isEnabled) {
            console.log(`[Agent:${agentDef.id}] Disabled for project ${projectId}`);
            return null;
        }
        
        const config = configRes.rows.length > 0 ? JSON.parse(String(configRes.rows[0].config_json || '{}')) : {};

        // Load previous run
        const lastRunRes = await turso.execute({
            sql: 'SELECT * FROM agent_runs WHERE project_id = ? AND agent_id = ? AND status = "success" ORDER BY started_at DESC LIMIT 1',
            args: [projectId, agentDef.id]
        });
        const previousRun = lastRunRes.rows.length > 0 ? {
            id: String(lastRunRes.rows[0].id),
            timestamp: String(lastRunRes.rows[0].started_at),
            resultJson: JSON.parse(String(lastRunRes.rows[0].result_json || '{}'))
        } : null;

        // Check cooldown
        if (previousRun && agentDef.cooldownMs) {
            const lastRunTime = new Date(previousRun.timestamp).getTime();
            const now = Date.now();
            if (now - lastRunTime < agentDef.cooldownMs) {
                console.log(`[Agent:${agentDef.id}] Cooldown active for project ${projectId}`);
                return null;
            }
        }

        // Create initial run record
        await turso.execute({
            sql: 'INSERT INTO agent_runs (id, project_id, agent_id, status, started_at) VALUES (?, ?, ?, ?, ?)',
            args: [runId, projectId, agentDef.id, 'running', startedAt]
        });

        // Run agent logic
        const context = {
            projectId,
            turso,
            aiComplete,
            aiBatch,
            previousRun,
            config
        };

        const result = await agentDef.execute(context);
        const completedAt = new Date().toISOString();
        const durationMs = Date.now() - new Date(startedAt).getTime();

        // Save run result
        await turso.execute({
            sql: `UPDATE agent_runs 
                  SET status = ?, summary = ?, result_json = ?, findings_count = ?, 
                      tasks_created = ?, alerts_sent = ?, completed_at = ?, duration_ms = ?
                  WHERE id = ?`,
            args: [
                result.status,
                result.summary,
                JSON.stringify(result.findings || []),
                result.findings?.length || 0,
                result.tasksCreated || 0,
                result.alertsSent || 0,
                completedAt,
                durationMs,
                runId
            ]
        });
        
        console.log(`[Agent:${agentDef.id}] Completed: ${result.status} - ${result.summary}`);
        return result;
    } catch (err) {
        console.error(`[Agent:${agentDef.id}] Execution failed:`, err);
        const completedAt = new Date().toISOString();
        const durationMs = Date.now() - new Date(startedAt).getTime();
        
        await turso.execute({
            sql: 'UPDATE agent_runs SET status = ?, summary = ?, completed_at = ?, duration_ms = ? WHERE id = ?',
            args: ['error', err.message, completedAt, durationMs, runId]
        });
        
        return { status: 'error', summary: err.message };
    }
}
