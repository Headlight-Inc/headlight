import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeSimilarWeb(
	domain: string,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const url = `https://www.similarweb.com/website/${encodeURIComponent(domain)}/`;

	try {
		const html = await fetchFn(url);
		const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

		const nextDataMatch = html.match(
			/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
		);
		if (nextDataMatch) {
			try {
				const nextData = JSON.parse(nextDataMatch[1]);
				const overview = nextData?.props?.pageProps?.overview;
				if (overview) {
					result.estimatedOrganicTraffic = overview.monthlyVisits || null;
					result.avgBounceRate = overview.bounceRate
						? Math.round(overview.bounceRate * 100)
						: null;
					result.avgSessionDuration = overview.avgVisitDuration || null;
					result.pagesPerVisit = overview.pagesPerVisit
						? Math.round(overview.pagesPerVisit * 10) / 10
						: null;
				}
			} catch {
				// ignore parse issues
			}
		}

		if (!result.estimatedOrganicTraffic) {
			const visitsMatch = text.match(/Total Visits[\s:]*([\.\d,]+[KMB]?)/i);
			if (visitsMatch)
				result.estimatedOrganicTraffic = parseAbbreviatedNumber(visitsMatch[1]);
		}
		if (!result.avgBounceRate) {
			const bounceMatch = text.match(/Bounce Rate[\s:]*([\.\d]+)%/i);
			if (bounceMatch)
				result.avgBounceRate = Math.round(parseFloat(bounceMatch[1]));
		}
		if (!result.avgSessionDuration) {
			const durationMatch = text.match(/(\d{2}):(\d{2}):(\d{2})/);
			if (durationMatch) {
				result.avgSessionDuration =
					parseInt(durationMatch[1], 10) * 3600 +
					parseInt(durationMatch[2], 10) * 60 +
					parseInt(durationMatch[3], 10);
			}
		}

		const sourcePatterns = [
			{ key: "direct", pattern: /Direct[\s:]*([\.\d]+)%/i },
			{ key: "referral", pattern: /Referr?als?[\s:]*([\.\d]+)%/i },
			{ key: "search", pattern: /Search[\s:]*([\.\d]+)%/i },
			{ key: "social", pattern: /Social[\s:]*([\.\d]+)%/i },
			{ key: "mail", pattern: /Mail[\s:]*([\.\d]+)%/i },
			{ key: "display", pattern: /Display[\s:]*([\.\d]+)%/i },
		];

		const sources: Record<string, number> = {};
		let anyFound = false;
		for (const { key, pattern } of sourcePatterns) {
			const m = text.match(pattern);
			if (m) {
				sources[key] = parseFloat(m[1]);
				anyFound = true;
			}
		}
		if (anyFound) result.trafficSourcesBreakdown = sources;

		const similarPattern = /similarweb\.com\/website\/([\w.-]+)/g;
		const similarSites = new Set<string>();
		let siteMatch: RegExpExecArray | null;
		while ((siteMatch = similarPattern.exec(html)) !== null) {
			const site = siteMatch[1].toLowerCase();
			if (site !== domain.toLowerCase() && !site.includes("similarweb"))
				similarSites.add(site);
		}
		if (similarSites.size > 0)
			result.similarSites = [...similarSites].slice(0, 10);

		const trendMatch = text.match(/([+-]?[\d.]+)%\s*(?:vs|from|compared)/i);
		if (trendMatch) result.trafficTrend30d = parseFloat(trendMatch[1]);
	} catch (err) {
		console.warn("[SimilarWebScraper] Failed:", err);
	}

	return result;
}
