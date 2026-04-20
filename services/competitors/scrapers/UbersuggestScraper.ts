import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeUbersuggest(
	domain: string,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const url = `https://app.neilpatel.com/en/seo_analyzer/overview?domain=${encodeURIComponent(domain)}`;

	try {
		const html = await fetchFn(url);
		const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

		const orgTraffic = text.match(
			/Organic.*?Monthly.*?Traffic[\s:]*([\.\d,]+[KMB]?)/i,
		);
		if (orgTraffic)
			result.estimatedOrganicTraffic = parseAbbreviatedNumber(orgTraffic[1]);

		const orgKw = text.match(/Organic.*?Keywords[\s:]*([\.\d,]+[KMB]?)/i);
		if (orgKw) result.totalRankingKeywords = parseAbbreviatedNumber(orgKw[1]);

		const domScore = text.match(/Domain Score[\s:]*(\d+)/i);
		if (domScore) result.domainAuthority = parseInt(domScore[1], 10);

		const blMatch = text.match(/Backlinks[\s:]*([\.\d,]+[KMB]?)/i);
		if (blMatch) result.totalBacklinks = parseAbbreviatedNumber(blMatch[1]);
	} catch (err) {
		console.warn("[UbersuggestScraper] Failed:", err);
	}

	return result;
}
