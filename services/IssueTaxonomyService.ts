/**
 * IssueTaxonomyService.ts
 *
 * Dynamic issue taxonomy that replaces the static SEO_ISSUES_TAXONOMY.
 * Generates, tracks, and prioritizes issues from real crawl data.
 *
 * Key capabilities:
 * - Traffic-weighted impact scoring (issues affecting high-traffic pages rank higher)
 * - Cross-crawl issue tracking (new, recurring, fixed, regressed)
 * - Automated fix suggestions with effort estimation
 * - Cannibalization detection
 * - Content decay alerts
 */

import {
	getAuditIssues,
	getAuditHistory,
	getLatestAuditResult,
} from "./CrawlPersistenceService";

// ─── Types ───────────────────────────────────────────────────

export interface ClassifiedIssue {
	id: string;
	category: string;
	title: string;
	description: string;
	priority: "Critical" | "High" | "Medium" | "Low";
	type: "error" | "warning" | "notice" | "passed";
	count: number;
	affectedUrls: string[];
	effort: "Low" | "Medium" | "High";
	scoreImpact: number;
	estimatedTrafficImpact: number;
	aiFix: string;
	trend:
		| "new"
		| "recurring"
		| "improving"
		| "worsening"
		| "fixed"
		| "regressed";
	trendDetail?: string;
}

export interface IssueSummary {
	totalIssues: number;
	critical: number;
	high: number;
	medium: number;
	low: number;
	errors: number;
	warnings: number;
	notices: number;
	topImpactIssues: ClassifiedIssue[];
	estimatedTotalTrafficImpact: number;
}

// ─── Issue Trend Tracking ────────────────────────────────────

/**
 * Compare issues from current audit against previous audit to determine trends.
 * Returns issues with trend annotations.
 */
export async function trackIssueTrends(
	projectId: string,
	currentIssues: any[],
): Promise<ClassifiedIssue[]> {
	// Fetch audit history to find the previous audit
	const history = await getAuditHistory(projectId, 2);

	if (history.length < 2) {
		// First crawl — all issues are "new"
		return currentIssues.map((issue) => ({
			id: issue.id || `${issue.category}-${issue.title}`,
			category: issue.category,
			title: issue.title,
			description: issue.desc || issue.description || "",
			priority: issue.priority || "Medium",
			type: issue.type || issue.issue_type || "warning",
			count: issue.count || issue.affected_count || 0,
			affectedUrls: issue.preview || issue.affected_urls || [],
			effort: issue.effort || "Medium",
			scoreImpact: issue.scoreImpact || issue.score_impact || 0,
			estimatedTrafficImpact: estimateTrafficImpact(issue),
			aiFix: issue.aiFix || issue.ai_fix || "",
			trend: "new" as const,
		}));
	}

	// Fetch previous audit's issues
	const previousAuditId = history[0].id; // First in ascending order = oldest
	const previousIssues = await getAuditIssues(previousAuditId);
	const previousIssueMap = new Map(
		previousIssues.map((i: any) => [i.title, i]),
	);

	return currentIssues.map((issue) => {
		const title = issue.title;
		const prevIssue = previousIssueMap.get(title);
		const currentCount = issue.count || issue.affected_count || 0;

		let trend: ClassifiedIssue["trend"] = "new";
		let trendDetail = "";

		if (prevIssue) {
			const prevCount = prevIssue.affected_count || 0;
			if (currentCount === 0 && prevCount > 0) {
				trend = "fixed";
				trendDetail = `Was affecting ${prevCount} pages, now resolved.`;
			} else if (currentCount > prevCount) {
				trend = "worsening";
				trendDetail = `Increased from ${prevCount} to ${currentCount} pages.`;
			} else if (currentCount < prevCount) {
				trend = "improving";
				trendDetail = `Decreased from ${prevCount} to ${currentCount} pages.`;
			} else {
				trend = "recurring";
				trendDetail = `Same ${currentCount} pages affected since last crawl.`;
			}
		}

		return {
			id: issue.id || `${issue.category}-${title}`,
			category: issue.category,
			title: title,
			description: issue.desc || issue.description || "",
			priority: issue.priority || "Medium",
			type: issue.type || issue.issue_type || "warning",
			count: currentCount,
			affectedUrls: issue.preview || issue.affected_urls || [],
			effort: issue.effort || "Medium",
			scoreImpact: issue.scoreImpact || issue.score_impact || 0,
			estimatedTrafficImpact: estimateTrafficImpact(issue),
			aiFix: issue.aiFix || issue.ai_fix || "",
			trend,
			trendDetail,
		};
	});
}

// ─── Traffic Impact Estimation ───────────────────────────────

/**
 * Estimate the potential traffic impact of fixing an issue.
 * Uses affected page count and issue type to generate a rough estimate.
 */
function estimateTrafficImpact(issue: any): number {
	const count = issue.count || issue.affected_count || 0;
	const priority = issue.priority || "Medium";

	// Weight by priority
	const priorityMultiplier: Record<string, number> = {
		Critical: 5,
		High: 3,
		Medium: 1.5,
		Low: 0.5,
	};

	// Estimate average monthly visitors per page (rough baseline)
	const avgVisitsPerPage = 50;
	const multiplier = priorityMultiplier[priority] || 1;

	// For title/meta issues, estimate CTR improvement
	if (
		issue.title?.includes("Title") ||
		issue.title?.includes("Meta Description")
	) {
		return Math.round(count * avgVisitsPerPage * 0.15 * multiplier); // 15% CTR improvement
	}

	// For broken pages, estimate lost traffic
	if (
		issue.title?.includes("Broken") ||
		issue.title?.includes("Server Error")
	) {
		return Math.round(count * avgVisitsPerPage * multiplier);
	}

	// For speed issues, estimate bounce rate reduction
	if (issue.title?.includes("Slow") || issue.title?.includes("LCP")) {
		return Math.round(count * avgVisitsPerPage * 0.1 * multiplier);
	}

	// Default moderate estimate
	return Math.round(count * avgVisitsPerPage * 0.05 * multiplier);
}

// ─── Issue Summary Generator ─────────────────────────────────

/**
 * Generate a high-level summary of all issues for dashboard display.
 */
export function generateIssueSummary(issues: ClassifiedIssue[]): IssueSummary {
	const summary: IssueSummary = {
		totalIssues: issues.length,
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
		errors: 0,
		warnings: 0,
		notices: 0,
		topImpactIssues: [],
		estimatedTotalTrafficImpact: 0,
	};

	for (const issue of issues) {
		// Count by priority
		switch (issue.priority) {
			case "Critical":
				summary.critical++;
				break;
			case "High":
				summary.high++;
				break;
			case "Medium":
				summary.medium++;
				break;
			case "Low":
				summary.low++;
				break;
		}

		// Count by type
		switch (issue.type) {
			case "error":
				summary.errors++;
				break;
			case "warning":
				summary.warnings++;
				break;
			case "notice":
				summary.notices++;
				break;
		}

		summary.estimatedTotalTrafficImpact += issue.estimatedTrafficImpact;
	}

	// Sort by estimated traffic impact and take top 5
	summary.topImpactIssues = [...issues]
		.sort((a, b) => b.estimatedTrafficImpact - a.estimatedTrafficImpact)
		.slice(0, 5);

	return summary;
}

// ─── Cannibalization Detection ───────────────────────────────

export interface CannibalizationGroup {
	keyword: string;
	pages: {
		url: string;
		title: string;
		gscPosition: number;
		gscClicks: number;
	}[];
	impact: string;
	suggestion: string;
}

/**
 * Detect keyword cannibalization from crawl pages with GSC data.
 * Groups pages that compete for the same keywords.
 */
export function detectCannibalization(pages: any[]): CannibalizationGroup[] {
	const titleGroups = new Map<string, any[]>();

	// Group by normalized title words (remove stopwords and short words)
	for (const page of pages) {
		if (!page.title || page.status_code !== 200) continue;

		const titleWords = page.title
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, "")
			.split(/\s+/)
			.filter((w: string) => w.length > 3)
			.sort()
			.join(" ");

		if (!titleWords) continue;

		if (!titleGroups.has(titleWords)) titleGroups.set(titleWords, []);
		titleGroups.get(titleWords)!.push(page);
	}

	const groups: CannibalizationGroup[] = [];

	for (const [keywords, groupPages] of titleGroups) {
		if (groupPages.length < 2) continue;

		groups.push({
			keyword: keywords,
			pages: groupPages.map((p: any) => ({
				url: p.url,
				title: p.title,
				gscPosition: p.gsc_position || 0,
				gscClicks: p.gsc_clicks || 0,
			})),
			impact: `${groupPages.length} pages competing for the same topic`,
			suggestion: `Consolidate these pages or differentiate their content. Use canonical tags to point to the strongest version.`,
		});
	}

	return groups.sort((a, b) => b.pages.length - a.pages.length);
}

// ─── Content Decay Detection ─────────────────────────────────

export interface ContentDecayAlert {
	url: string;
	title: string;
	previousClicks: number;
	currentClicks: number;
	dropPercentage: number;
	suggestion: string;
}

/**
 * Detect content decay by comparing GSC click data between audits.
 * Pages that used to get traffic but are declining get flagged.
 */
export function detectContentDecay(
	currentPages: any[],
	previousPages: any[],
): ContentDecayAlert[] {
	if (!previousPages || previousPages.length === 0) return [];

	const prevPageMap = new Map(previousPages.map((p: any) => [p.url, p]));
	const decayAlerts: ContentDecayAlert[] = [];

	for (const page of currentPages) {
		const prevPage = prevPageMap.get(page.url);
		if (!prevPage) continue;

		const currentClicks = page.gsc_clicks || 0;
		const previousClicks = prevPage.gsc_clicks || 0;

		// Only flag if previously had meaningful traffic
		if (previousClicks < 10) continue;

		const dropPercentage =
			((previousClicks - currentClicks) / previousClicks) * 100;

		// Flag if dropped more than 30%
		if (dropPercentage > 30) {
			decayAlerts.push({
				url: page.url,
				title: page.title || page.url,
				previousClicks,
				currentClicks,
				dropPercentage: Math.round(dropPercentage),
				suggestion:
					dropPercentage > 70
						? "This page has lost most of its traffic. Consider a full content refresh or check if it was deindexed."
						: "Traffic is declining. Update the content with fresh information and check for new competitor pages targeting the same queries.",
			});
		}
	}

	return decayAlerts.sort((a, b) => b.dropPercentage - a.dropPercentage);
}
