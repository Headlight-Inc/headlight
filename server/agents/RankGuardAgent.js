/**
 * RankGuardAgent.js
 * Investigate rank drops, correlate with site changes, suggest fixes
 */

import { randomUUID } from "crypto";

export const RankGuardAgent = {
	id: "rank-guard",
	name: "Rank Guard",
	trigger: "cron",
	schedule: "daily",
	targetHour: 6,
	cooldownMs: 20 * 60 * 60 * 1000,

	execute: async (context) => {
		const { projectId, turso, aiComplete } = context;

		// 1. Load latest 2 enriched crawl sessions
		const sessionsRes = await turso.execute({
			sql: "SELECT session_id FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 2",
			args: [projectId],
		});

		if (sessionsRes.rows.length < 2) {
			return {
				status: "partial",
				summary:
					"Need at least 2 crawl runs with GSC data to monitor rank shifts.",
			};
		}

		const currentSession = String(sessionsRes.rows[0].session_id);
		const previousSession = String(sessionsRes.rows[1].session_id);

		// 2. Load GSC-enriched pages from both sessions
		const pagesQuery = `
            SELECT url, title, gsc_position, gsc_clicks, gsc_impressions, 
                   health_score, status_code, content_hash, canonical, meta_robots
            FROM crawl_pages 
            WHERE session_id = ? AND gsc_impressions > 50
        `;

		const currentPagesRes = await turso.execute({
			sql: pagesQuery,
			args: [currentSession],
		});
		const previousPagesRes = await turso.execute({
			sql: pagesQuery,
			args: [previousSession],
		});

		const currentPages = currentPagesRes.rows;
		const previousPagesMap = new Map(
			previousPagesRes.rows.map((p) => [String(p.url), p]),
		);

		const drops = [];
		for (const page of currentPages) {
			const prev = previousPagesMap.get(String(page.url));
			if (!prev) continue;

			const currPos = Number(page.gsc_position || 0);
			const prevPos = Number(prev.gsc_position || 0);
			const currClicks = Number(page.gsc_clicks || 0);
			const prevClicks = Number(prev.gsc_clicks || 0);

			// Flag if position increased by >= 5 (rank drop) or clicks dropped > 50%
			const posDrop = currPos - prevPos;
			const clickDropPct =
				prevClicks > 0 ? (prevClicks - currClicks) / prevClicks : 0;

			if (posDrop >= 5 || clickDropPct > 0.5) {
				// Correlate with crawl changes
				const correlations = [];
				if (String(page.content_hash) !== String(prev.content_hash))
					correlations.push("Content changed");
				if (page.status_code !== prev.status_code)
					correlations.push(
						`Status code changed: ${prev.status_code} -> ${page.status_code}`,
					);
				if (String(page.canonical) !== String(prev.canonical))
					correlations.push("Canonical URL changed");
				if (String(page.meta_robots) !== String(prev.meta_robots))
					correlations.push("Meta robots changed");
				if (
					Number(prev.health_score || 100) - Number(page.health_score || 100) >
					20
				)
					correlations.push("Health score dropped significantly");

				drops.push({
					url: page.url,
					title: page.title,
					prevPos,
					currPos,
					posDrop,
					clickDropPct: Math.round(clickDropPct * 100),
					correlations,
					impressions: page.gsc_impressions,
				});
			}
		}

		if (drops.length === 0) {
			return {
				status: "success",
				summary: "Search rankings are stable. No significant drops detected.",
				findings: [],
			};
		}

		// 3. AI Analysis for top drops
		const topDrops = drops
			.sort((a, b) => Number(b.impressions) - Number(a.impressions))
			.slice(0, 5);

		let tasksCreated = 0;
		const findings = [];

		for (const drop of topDrops) {
			const prompt = `
                The following page has dropped in search rankings:
                URL: ${drop.url}
                Previous Position: ${drop.prevPos.toFixed(1)}
                Current Position: ${drop.currPos.toFixed(1)}
                Position Drop: ${drop.posDrop.toFixed(1)}
                Traffic Drop: ${drop.clickDropPct}%
                Crawl Changes Detected: ${drop.correlations.join(", ") || "None"}

                Please provide:
                1. A brief diagnosis of why the rank dropped.
                2. 3-4 specific steps to recover the ranking.
                3. Urgency level: High or Critical.

                Format as JSON: { "diagnosis": "", "recoverySteps": [], "urgency": "" }
            `;

			const aiRes = await aiComplete({ prompt, format: "json" }, turso);
			let analysis = {
				diagnosis: "Rank fluctuation.",
				recoverySteps: ["Monitor position and content quality."],
				urgency: "High",
			};
			try {
				analysis = JSON.parse(aiRes.text);
			} catch (e) {}

			// 4. Create task if drop is significant
			const taskId = randomUUID();
			const description = `
                **Ranking Drop Detected:** Position moved from ${drop.prevPos.toFixed(1)} to ${drop.currPos.toFixed(1)} (Drop of ${drop.posDrop.toFixed(1)}).
                
                **Traffic Impact:** ${drop.clickDropPct}% decrease in clicks.
                
                **Correlations Foundations:** ${drop.correlations.join(", ") || "No technical changes detected."}
                
                **AI Diagnosis:** ${analysis.diagnosis}
                
                **Recovery Plan:**
                - ${analysis.recoverySteps.join("\n- ")}
                
                *This investigation was performed by the Rank Guard AI Agent.*
            `.trim();

			await turso.execute({
				sql: `INSERT INTO crawl_tasks (
                    id, project_id, title, description, status, priority, 
                    category, source, affected_urls_json, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
				args: [
					taskId,
					projectId,
					`Rank Recovery: ${drop.url}`,
					description,
					"todo",
					String(analysis.urgency).toLowerCase() === "critical"
						? "critical"
						: "high",
					"seo",
					"agent:rank-guard",
					JSON.stringify([drop.url]),
					"ai-agent",
				],
			});

			tasksCreated++;
			findings.push({
				type: "rank_drop",
				title: `Rank Drop on ${drop.url}`,
				body: `Dropped ${drop.posDrop.toFixed(1)} positions. Diagnosis: ${analysis.diagnosis}`,
				severity: String(analysis.urgency).toLowerCase(),
				data: { url: drop.url, analysis },
			});
		}

		return {
			status: "success",
			summary: `Investigated ${drops.length} ranking drops. Generated recovery plans for ${tasksCreated} high-impact pages.`,
			findings,
			tasksCreated,
		};
	},
};
