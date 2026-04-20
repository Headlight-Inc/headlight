import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeAhrefs(
	domain: string,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const url = `https://ahrefs.com/backlink-checker?target=${encodeURIComponent(domain)}`;

	try {
		const html = await fetchFn(url);
		const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

		const drMatch = text.match(/Domain Rating[\s:]*(\d+)/i);
		if (drMatch) {
			result.ahrefsDR = parseInt(drMatch[1], 10);
			result.domainAuthority = result.ahrefsDR;
			result.urlRating = result.ahrefsDR;
		}

		const blMatch = text.match(/Backlinks[\s:]*([\.\d,]+[KMB]?)/i);
		if (blMatch) result.totalBacklinks = parseAbbreviatedNumber(blMatch[1]);

		const rdMatch = text.match(/Referring\s*domains?[\s:]*([\.\d,]+[KMB]?)/i);
		if (rdMatch) result.referringDomains = parseAbbreviatedNumber(rdMatch[1]);

		const firstSeenDates: number[] = [];
		const datePattern = /First seen[\s:]*([\w]+ \d{1,2},? \d{4})/gi;
		let dateMatch: RegExpExecArray | null;
		while ((dateMatch = datePattern.exec(text)) !== null) {
			const ts = Date.parse(dateMatch[1]);
			if (!Number.isNaN(ts)) firstSeenDates.push(ts);
		}
		if (firstSeenDates.length > 0) {
			const sixtyDaysAgo = Date.now() - 60 * 86400000;
			result.linkVelocity60d = firstSeenDates.filter(
				(d) => d >= sixtyDaysAgo,
			).length;
		}
	} catch (err) {
		console.warn("[AhrefsScraper] Failed:", err);
	}

	return result;
}
