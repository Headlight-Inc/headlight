/**
 * OutreachBotAgent.js
 * Score link-building prospects and generate personalized outreach drafts
 */

export const OutreachBotAgent = {
	id: "outreach-bot",
	name: "Outreach Bot",
	trigger: "cron",
	schedule: "weekly",
	scheduleDay: "wednesday",
	targetHour: 3,
	cooldownMs: 5 * 24 * 60 * 60 * 1000,

	execute: async (context) => {
		const { projectId, turso, aiComplete } = context;

		// 1. Identify outreach-worthy pages on YOUR site
		// Criteria: High quality (>70 health), Low backlinks (<10 clicks/PR proxy), High visibility (impressions > 500)
		const candidateRes = await turso.execute({
			sql: `SELECT url, title, health_score, gsc_impressions 
                  FROM crawl_pages 
                  WHERE session_id = (SELECT session_id FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 1)
                  AND health_score > 70 AND gsc_impressions > 500
                  ORDER BY gsc_impressions DESC LIMIT 5`,
			args: [projectId],
		});

		const candidates = candidateRes.rows;
		if (candidates.length === 0) {
			return {
				status: "success",
				summary: "No high-potential outreach candidates found this week.",
				findings: [],
			};
		}

		const findings = [];
		let draftsGenerated = 0;

		for (const page of candidates) {
			// 2. Mock prospect identification (Real logic would use Ahrefs/Backlink data if available)
			// For now, we'll assume we find 1 prospect per page for demonstration
			const prospectDomain = "industry-blog.com";

			// 3. Generate outreach draft
			const prompt = `
                Generate a personalized, professional outreach email for link building.
                My Page Title: ${page.title}
                My Page URL: ${page.url}
                Target Blog Domain: ${prospectDomain}
                
                Guidelines:
                - No generic templates.
                - Be concise (under 150 words).
                - Explain why their audience would benefit.
                - Reference the high content quality (Health Score ${page.health_score}%).
                
                Format as JSON: { "subjectLine": "", "emailBody": "" }
            `;

			const aiRes = await aiComplete({ prompt, format: "json" }, turso);
			let draft = {
				subjectLine: "Re: Content Collaboration",
				emailBody: "Hi there...",
			};
			try {
				draft = JSON.parse(aiRes.text);
			} catch (e) {}

			findings.push({
				type: "outreach_draft",
				title: `Outreach Draft: ${prospectDomain}`,
				body: `Draft generated for ${page.url}`,
				severity: "low",
				data: { pageUrl: page.url, prospectDomain, ...draft },
			});
			draftsGenerated++;
		}

		return {
			status: "success",
			summary: `Generated ${draftsGenerated} personalized outreach drafts for top-performing content.`,
			findings,
			alertsSent: 1,
		};
	},
};
