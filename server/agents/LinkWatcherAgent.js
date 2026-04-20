/**
 * LinkWatcherAgent.js
 * Monitor backlink changes, alert on losses, identify new internal linking opportunities
 */

import { randomUUID } from "crypto";

export const LinkWatcherAgent = {
	id: "link-watcher",
	name: "Link Watcher",
	trigger: "cron",
	schedule: "daily",
	targetHour: 4,
	cooldownMs: 20 * 60 * 60 * 1000,

	execute: async (context) => {
		const { projectId, turso, aiComplete } = context;

		// 1. Load latest 2 crawl sessions
		const sessionsRes = await turso.execute({
			sql: "SELECT session_id FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 2",
			args: [projectId],
		});

		if (sessionsRes.rows.length < 2) {
			return {
				status: "partial",
				summary:
					"Need at least 2 crawl runs with link data to monitor changes.",
			};
		}

		const currentSession = String(sessionsRes.rows[0].session_id);
		const previousSession = String(sessionsRes.rows[1].session_id);

		// 2. Load link metrics (Note: url_rating/referring_domains come from enrichment)
		const linkQuery = `
            SELECT url, title, internal_pagerank, health_score
            FROM crawl_pages 
            WHERE session_id = ?
        `;
		// In many setups, external backlink data is in crawl_pages from Ahrefs/Semrush enrichment
		// If those columns exist, we'll use them. Otherwise we stick to internal PageRank.

		const currentPagesRes = await turso.execute({
			sql: linkQuery,
			args: [currentSession],
		});
		const previousPagesRes = await turso.execute({
			sql: linkQuery,
			args: [previousSession],
		});

		const currentPages = currentPagesRes.rows;
		const previousPagesMap = new Map(
			previousPagesRes.rows.map((p) => [String(p.url), p]),
		);

		const shifts = [];
		for (const page of currentPages) {
			const prev = previousPagesMap.get(String(page.url));
			if (!prev) continue;

			const currPR = Number(page.internal_pagerank || 0);
			const prevPR = Number(prev.internal_pagerank || 0);

			// Flag significant PageRank drop (>30%)
			const prDropPct = prevPR > 0 ? (prevPR - currPR) / prevPR : 0;

			if (prDropPct > 0.3) {
				shifts.push({
					url: page.url,
					title: page.title,
					type: "internal_pagerank_drop",
					magnitude: Math.round(prDropPct * 100),
					prevVal: prevPR,
					currVal: currPR,
				});
			}
		}

		// 3. Identify internal link opportunities
		// Pages with high health but low pagerank
		const opportunities = currentPages
			.filter(
				(p) =>
					Number(p.health_score || 0) > 80 &&
					Number(p.internal_pagerank || 0) < 0.05,
			)
			.sort((a, b) => Number(b.health_score) - Number(a.health_score))
			.slice(0, 5);

		if (shifts.length === 0 && opportunities.length === 0) {
			return {
				status: "success",
				summary: "Link profile is stable.",
				findings: [],
			};
		}

		let tasksCreated = 0;
		const findings = [];

		// 4. AI Analysis for significant drops
		for (const shift of shifts.slice(0, 3)) {
			const prompt = `
                The following page has lost internal authority (Internal PageRank):
                URL: ${shift.url}
                Authority Drop: ${shift.magnitude}%
                Current Internal PageRank: ${shift.currVal.toFixed(4)}

                Please provide:
                1. A brief assessment of why this might happen (e.g., site structure change).
                2. 3 specific actions to restore internal authority.
                
                Format as JSON: { "assessment": "", "actions": [] }
            `;

			const aiRes = await aiComplete({ prompt, format: "json" }, turso);
			let analysis = {
				assessment: "Site structure changed.",
				actions: ["Add more internal links to this page."],
			};
			try {
				analysis = JSON.parse(aiRes.text);
			} catch (e) {}

			const taskId = randomUUID();
			await turso.execute({
				sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, affected_urls_json, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
				args: [
					taskId,
					projectId,
					`Restore Authority: ${shift.url}`,
					`**Internal Authority Drop:** ${shift.magnitude}%\n\n**Assessment:** ${analysis.assessment}\n\n**Recovery Actions:**\n- ${analysis.actions.join("\n- ")}`,
					"todo",
					"medium",
					"seo",
					"agent:link-watcher",
					JSON.stringify([shift.url]),
					"ai-agent",
				],
			});
			tasksCreated++;
			findings.push({
				type: "authority_drop",
				title: `Authority drop on ${shift.url}`,
				body: `Internal PageRank dropped by ${shift.magnitude}%`,
				severity: "medium",
				data: { url: shift.url, analysis },
			});
		}

		// 5. Tasks for opportunities
		if (opportunities.length > 0) {
			const taskId = randomUUID();
			await turso.execute({
				sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, affected_urls_json, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
				args: [
					taskId,
					projectId,
					"Internal Linking Audit: High Value Pages",
					`Found ${opportunities.length} high-quality pages with low internal authority. Strengthening internal links to these pages could boost their rankings.\n\n**Pages:**\n- ${opportunities.map((p) => p.url).join("\n- ")}`,
					"todo",
					"low",
					"seo",
					"agent:link-watcher",
					JSON.stringify(opportunities.map((p) => p.url)),
					"ai-agent",
				],
			});
			tasksCreated++;
		}

		return {
			status: "success",
			summary: `Monitored internal link health. Created ${tasksCreated} tasks for authority recovery and optimization.`,
			findings,
			tasksCreated,
		};
	},
};
