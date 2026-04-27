// server/persistence/MetricPersistence.js
import { createClient } from '@libsql/client';

const turso = createClient({
	url: process.env.VITE_TURSO_DATABASE_URL,
	authToken: process.env.VITE_TURSO_AUTH_TOKEN
});

export async function saveMetricSamples(sessionId, url, samples) {
	const batch = samples.map(s => ({
		sql: `INSERT OR REPLACE INTO metric_samples (session_id, url, metric_key, value, source, timestamp) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
		args: [sessionId, url, s.key, JSON.stringify(s.value), s.source]
	}));
	await turso.batch(batch, 'write');
}

export async function loadMetricSamples(sessionId, url = null) {
    const result = await turso.execute({
        sql: url 
            ? `SELECT metric_key, value, source FROM metric_samples WHERE session_id = ? AND url = ?`
            : `SELECT metric_key, value, source, url FROM metric_samples WHERE session_id = ?`,
        args: url ? [sessionId, url] : [sessionId]
    });
    return result.rows.map(r => ({
        key: r.metric_key,
        value: JSON.parse(String(r.value)),
        source: r.source,
        url: r.url
    }));
}

