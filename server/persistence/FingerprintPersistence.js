// server/persistence/FingerprintPersistence.js
import { createClient } from '@libsql/client';

const turso = createClient({
	url: process.env.VITE_TURSO_DATABASE_URL,
	authToken: process.env.VITE_TURSO_AUTH_TOKEN
});

export async function saveFingerprint(sessionId, fp) {
	await turso.execute({
		sql: `INSERT OR REPLACE INTO crawl_fingerprints (session_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
		args: [sessionId, JSON.stringify(fp)]
	});
}

export async function loadFingerprint(sessionId) {
    const result = await turso.execute({
        sql: `SELECT data FROM crawl_fingerprints WHERE session_id = ?`,
        args: [sessionId === 'latest' ? 
            (await turso.execute('SELECT session_id FROM crawl_fingerprints ORDER BY updated_at DESC LIMIT 1')).rows[0]?.session_id : 
            sessionId]
    });
    return result.rows[0] ? JSON.parse(String(result.rows[0].data)) : null;
}
