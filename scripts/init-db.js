import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const url = process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.VITE_TURSO_AUTH_TOKEN;

if (!url) {
	console.error("Error: VITE_TURSO_DATABASE_URL is not defined in .env.local");
	process.exit(1);
}

const client = createClient({ url, authToken });

async function init() {
	console.log("Initializing Turso Database...");

	try {
		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_sessions (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_pages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        status_code INTEGER,
        load_time INTEGER,
        gsc_clicks INTEGER DEFAULT 0,
        gsc_impressions INTEGER DEFAULT 0,
        internal_pagerank REAL DEFAULT 0,
        health_score INTEGER DEFAULT 100,
        content_hash TEXT,
        screenshot_url TEXT,
        metadata TEXT,
        FOREIGN KEY (session_id) REFERENCES crawl_sessions(id)
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_jobs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        execution_mode TEXT NOT NULL,
        policy TEXT NOT NULL,
        retention_policy TEXT NOT NULL,
        entry_urls_json TEXT NOT NULL,
        limits_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_runs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        status TEXT NOT NULL,
        crawl_mode TEXT NOT NULL,
        execution_mode TEXT NOT NULL,
        policy TEXT NOT NULL,
        retention_policy TEXT NOT NULL,
        url_crawled TEXT NOT NULL,
        summary_json TEXT NOT NULL,
        thematic_scores_json TEXT NOT NULL,
        evidence_sources_json TEXT NOT NULL,
        runtime_json TEXT NOT NULL,
        top_pages_json TEXT NOT NULL,
        issue_overview_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_issue_clusters (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        affected_count INTEGER NOT NULL DEFAULT 0,
        affected_urls_json TEXT NOT NULL,
        effort TEXT NOT NULL,
        score_impact INTEGER NOT NULL DEFAULT 0,
        ai_fix TEXT NOT NULL,
        trend TEXT NOT NULL DEFAULT 'new',
        evidence_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_page_insights (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        url TEXT NOT NULL,
        is_changed INTEGER NOT NULL DEFAULT 0,
        is_top_page INTEGER NOT NULL DEFAULT 0,
        has_severe_issues INTEGER NOT NULL DEFAULT 0,
        severity_rank INTEGER NOT NULL DEFAULT 0,
        priority_score REAL NOT NULL DEFAULT 0,
        evidence_sources_json TEXT NOT NULL,
        summary_json TEXT NOT NULL,
        full_data_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS trend_snapshots (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        snapshot_at DATETIME NOT NULL,
        metrics_json TEXT NOT NULL
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS integration_connections (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        label TEXT NOT NULL,
        status TEXT NOT NULL,
        auth_type TEXT NOT NULL,
        account_label TEXT,
        scopes_json TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        selection_json TEXT NOT NULL,
        sync_json TEXT NOT NULL,
        secret_ref TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS crawl_status (
        project_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        progress REAL NOT NULL DEFAULT 0,
        current_url TEXT,
        urls_crawled INTEGER NOT NULL DEFAULT 0,
        session_id TEXT,
        event_type TEXT,
        event_message TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        scopes_json TEXT NOT NULL,
        rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
        last_used_at DATETIME,
        revoked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS webhook_endpoints (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events_json TEXT NOT NULL,
        secret TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_delivery_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        response_body TEXT,
        latency_ms INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

		await client.execute(`
      CREATE TABLE IF NOT EXISTS page_snapshots (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        url TEXT NOT NULL,
        content_hash TEXT,
        title TEXT,
        meta_desc TEXT,
        canonical TEXT,
        status_code INTEGER,
        schema_types_json TEXT,
        robots TEXT,
        snapshot_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        changed INTEGER NOT NULL DEFAULT 0,
        change_type TEXT
      )
    `);

		console.log("Successfully initialized database schema.");
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}
}

init();
