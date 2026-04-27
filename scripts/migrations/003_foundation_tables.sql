-- scripts/migrations/003_foundation_tables.sql

CREATE TABLE IF NOT EXISTS crawl_fingerprints (
    session_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metric_samples (
    session_id TEXT NOT NULL,
    url TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    value TEXT,
    source TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, url, metric_key, source)
);

CREATE TABLE IF NOT EXISTS scored_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    scope_id TEXT NOT NULL,
    code TEXT NOT NULL,
    severity TEXT NOT NULL,
    impact REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metric_samples_session ON metric_samples(session_id);
CREATE INDEX IF NOT EXISTS idx_scored_actions_session ON scored_actions(session_id);
