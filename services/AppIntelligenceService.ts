import { turso, isCloudSyncEnabled } from "./turso";
import { getSessions, getPages } from "./CrawlHistoryService";
import { getAIRouter } from "./ai";

const fallbackInsights = () => ({
	visibility: { overallScore: 0, trend: "neutral", trendValue: 0 },
	summary: null,
	thematicScores: null,
	issueOverview: null,
	insights: [
		{
			title: "Run your first crawl",
			detail: "Connect your site to get actionable insights.",
		},
	],
});

export const generateContentPrediction = async (topic: string) => {
	try {
		const router = getAIRouter();
		const response = await router.complete({
			taskType: "summarize",
			systemPrompt:
				"You are an SEO Content Strategist. For the given topic, provide a JSON response including: a project score (0-100), the primary search intent (Informational, Navigational, Commercial, Transactional), search volume estimation, difficulty level (0-100), a 3-part content outline (H2 and subtopics), and 3 specific SEO recommendations.",
			prompt: `Topic: ${topic}\n\nPlease format as JSON: { "score": number, "intent": string, "volume": number, "difficulty": number, "outline": Array<{h2: string, subtopics: string[]}>, "recommendations": string[] }`,
			format: "json",
		});

		const data =
			typeof response.text === "string"
				? JSON.parse(response.text)
				: response.text;
		return data;
	} catch (error) {
		console.error("Content prediction error:", error);
		return {
			score: 0,
			intent: "Informational",
			volume: 0,
			difficulty: 0,
			outline: [],
			recommendations: [
				"AI prediction unavailable. Re-run after connecting an AI provider.",
			],
		};
	}
};

export const generateDashboardInsights = async (projectId: string) => {
	try {
		// Cloud-backed summary when available.
		if (isCloudSyncEnabled) {
			const result = await turso().execute({
				sql: "SELECT summary_json, thematic_scores_json FROM crawl_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
				args: [projectId],
			});
			if (result.rows.length > 0) {
				const summary = JSON.parse(String(result.rows[0].summary_json || "{}"));
				const scores = JSON.parse(
					String(result.rows[0].thematic_scores_json || "{}"),
				);
				return {
					visibility: {
						overallScore: summary.healthScore || 0,
						trend:
							summary.scoreDelta > 0
								? "up"
								: summary.scoreDelta < 0
									? "down"
									: "neutral",
						trendValue: Math.abs(summary.scoreDelta || 0),
					},
					summary,
					thematicScores: scores,
					issueOverview: null,
					insights: Array.isArray(scores.topInsights) ? scores.topInsights : [],
				};
			}
		}

		// Local fallback from IndexedDB crawl history.
		const sessions = await getSessions(2);
		const latest =
			sessions.find((session) => session.projectId === projectId) ||
			sessions[0];
		if (!latest) return fallbackInsights();
		const pages = await getPages(latest.id);
		const previous = sessions.find(
			(session) =>
				session.id !== latest.id && session.projectId === latest.projectId,
		);
		const overallScore = Math.round(
			pages.reduce((sum, page) => sum + Number(page.healthScore || 0), 0) /
				Math.max(1, pages.length),
		);
		const scoreDelta = previous
			? overallScore - Number(previous.healthScore || 0)
			: 0;
		return {
			visibility: {
				overallScore,
				trend: scoreDelta > 0 ? "up" : scoreDelta < 0 ? "down" : "neutral",
				trendValue: Math.abs(scoreDelta),
			},
			summary: { healthScore: overallScore },
			thematicScores: null,
			issueOverview: null,
			insights: [
				{
					title: "Local crawl snapshot loaded",
					detail:
						"Cloud summary is unavailable, showing insights from your latest local crawl.",
				},
			],
		};
	} catch (error) {
		console.error("Failed to generate dashboard insights:", error);
		return fallbackInsights();
	}
};
