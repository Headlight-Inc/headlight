/**
 * TrafficAnalystAgent.js
 * Investigate traffic anomalies, identify causes, and generate reports
 */

import { randomUUID } from "crypto";

export const TrafficAnalystAgent = {
	id: "traffic-analyst",
	name: "Traffic Analyst",
	trigger: "event",
	event: "crawl.completed",
	cooldownMs: 12 * 60 * 60 * 1000,

	execute: async (context) => {
		const { projectId, turso, aiComplete } = context;

		// 1. Load GA4-enriched data from latest 2 sessions
		const sessionsRes = await turso.execute({
			sql: "SELECT session_id FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 2",
			args: [projectId],
		});

		if (sessionsRes.rows.length < 2) {
			return {
				status: "partial",
				summary:
					"Need at least 2 sessions with traffic data to analyze trends.",
			};
		}

		const currentSession = String(sessionsRes.rows[0].session_id);
		const previousSession = String(sessionsRes.rows[1].session_id);

		const trafficQuery = `
            SELECT url, title, ga4_sessions, ga4_users, ga4_bounce_rate, 
                   ga4_conversions, gsc_clicks, health_score, status_code
            FROM crawl_pages 
            WHERE session_id = ? AND ga4_sessions IS NOT NULL
        `;

		const currentPagesRes = await turso.execute({
			sql: trafficQuery,
			args: [currentSession],
		});
		const previousPagesRes = await turso.execute({
			sql: trafficQuery,
			args: [previousSession],
		});

		const currentPages = currentPagesRes.rows;
		const previousPagesMap = new Map(
			previousPagesRes.rows.map((p) => [String(p.url), p]),
		);

		const anomalies = [];
		let totalCurrentSessions = 0;
		let totalPrevSessions = 0;

		for (const page of currentPages) {
			totalCurrentSessions += Number(page.ga4_sessions || 0);
			const prev = previousPagesMap.get(String(page.url));
			if (!prev) continue;

			totalPrevSessions += Number(prev.ga4_sessions || 0);

			const currSessions = Number(page.ga4_sessions || 0);
			const prevSessions = Number(prev.ga4_sessions || 0);
			const sessionDropPct =
				prevSessions > 20 ? (prevSessions - currSessions) / prevSessions : 0;

			if (sessionDropPct > 0.5) {
				// Correlate with status codes/health
				const issues = [];
				if (page.status_code !== 200)
					issues.push(`Status code is ${page.status_code}`);
				if (Number(page.health_score || 100) < 60)
					issues.push("Low health score");

				anomalies.push({
					url: page.url,
					type: "page_traffic_drop",
					magnitude: Math.round(sessionDropPct * 100),
					issues,
				});
			}
		}

		const siteWideDrop =
			totalPrevSessions > 100
				? (totalPrevSessions - totalCurrentSessions) / totalPrevSessions
				: 0;
		if (siteWideDrop > 0.2) {
			anomalies.push({
				type: "site_wide_drop",
				magnitude: Math.round(siteWideDrop * 100),
				current: totalCurrentSessions,
				previous: totalPrevSessions,
			});
		}

		if (anomalies.length === 0) {
			return {
				status: "success",
				summary: "Traffic levels are healthy and stable.",
				findings: [],
			};
		}

		// 2. AI Executive Summary
		const summaryPrompt = `
            Analyze these traffic anomalies for project ${projectId}:
            ${JSON.stringify(anomalies.slice(0, 10))}
            
            Provide a 3-4 sentence executive summary of the traffic health and likely causes.
        `;
		const aiSummaryRes = await aiComplete({ prompt: summaryPrompt }, turso);
		const executiveSummary = aiSummaryRes.text;

		let tasksCreated = 0;
		const findings = [];

		// 3. Create tasks for critical anomalies
		if (siteWideDrop > 0.2) {
			const taskId = randomUUID();
			await turso.execute({
				sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
				args: [
					taskId,
					projectId,
					"Critical: Site-wide Traffic Drop Investigation",
					`**Anomaly:** ${Math.round(siteWideDrop * 100)}% decrease in total sessions.\n\n**Analysis:** ${executiveSummary}`,
					"todo",
					"critical",
					"analytics",
					"agent:traffic-analyst",
					"ai-agent",
				],
			});
			tasksCreated++;
		}

		for (const anomaly of anomalies
			.filter((a) => a.type === "page_traffic_drop")
			.slice(0, 3)) {
			const taskId = randomUUID();
			await turso.execute({
				sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, affected_urls_json, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
				args: [
					taskId,
					projectId,
					`Investigate Traffic Drop: ${anomaly.url}`,
					`**Anomaly:** ${anomaly.magnitude}% decrease in sessions.\n\n**Potential Technical Causes:** ${anomaly.issues.join(", ") || "None detected in crawl."}`,
					"todo",
					"high",
					"analytics",
					"agent:traffic-analyst",
					JSON.stringify([anomaly.url]),
					"ai-agent",
				],
			});
			tasksCreated++;
			findings.push({
				type: "traffic_anomaly",
				title: `Traffic drop on ${anomaly.url}`,
				body: `${anomaly.magnitude}% drop in sessions.`,
				severity: "high",
				data: anomaly,
			});
		}

		return {
			status: "success",
			summary: executiveSummary,
			findings,
			tasksCreated,
		};
	},
};
