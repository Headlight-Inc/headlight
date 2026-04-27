// server/persistence/ActionPersistence.js
import { createClient } from '@libsql/client';

const turso = createClient({
	url: process.env.VITE_TURSO_DATABASE_URL,
	authToken: process.env.VITE_TURSO_AUTH_TOKEN
});

export async function saveScoredActions(sessionId, scopeId, actions) {
	const batch = actions.map(a => ({
		sql: `INSERT INTO scored_actions (session_id, scope_id, code, severity, impact) VALUES (?, ?, ?, ?, ?)`,
		args: [sessionId, scopeId, a.code, a.severity, a.impactScore]
	}));
	await turso.batch(batch, 'write');
}

export async function loadScoredActions(sessionId) {
    const result = await turso.execute({
        sql: `SELECT scope_id, code, severity, impact FROM scored_actions WHERE session_id = ?`,
        args: [sessionId]
    });
    return result.rows.map(r => ({
        scopeId: r.scope_id,
        code: r.code,
        severity: r.severity,
        impactScore: r.impact
    }));
}
