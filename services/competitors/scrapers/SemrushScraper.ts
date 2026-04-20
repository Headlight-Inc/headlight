import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeSemrush(
	domain: string,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const url = `https://www.semrush.com/analytics/overview/?q=${encodeURIComponent(domain)}&searchType=domain`;

	try {
		const html = await fetchFn(url);
		const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

		const orgTraffic = text.match(/Organic.*?Traffic[\s:]*([\.\d,]+[KMB]?)/i);
		if (orgTraffic)
			result.estimatedOrganicTraffic = parseAbbreviatedNumber(orgTraffic[1]);

		const orgKw = text.match(/Organic.*?Keywords[\s:]*([\.\d,]+[KMB]?)/i);
		if (orgKw) result.totalRankingKeywords = parseAbbreviatedNumber(orgKw[1]);

		const authScore = text.match(/Authority Score[\s:]*(\d+)/i);
		if (authScore) result.domainAuthority = parseInt(authScore[1], 10);

		const paidTraffic = text.match(/Paid.*?Traffic[\s:]*([\.\d,]+[KMB]?)/i);
		if (paidTraffic) result.adsTraffic = parseAbbreviatedNumber(paidTraffic[1]);

		const paidKw = text.match(/Paid.*?Keywords[\s:]*([\.\d,]+[KMB]?)/i);
		if (paidKw) result.ppcKeywordsCount = parseAbbreviatedNumber(paidKw[1]);

		const blMatch = text.match(/Backlinks[\s:]*([\.\d,]+[KMB]?)/i);
		if (blMatch) result.totalBacklinks = parseAbbreviatedNumber(blMatch[1]);

		const rdMatch = text.match(/Referring Domains[\s:]*([\.\d,]+[KMB]?)/i);
		if (rdMatch) result.referringDomains = parseAbbreviatedNumber(rdMatch[1]);
	} catch (err) {
		console.warn("[SemrushScraper] Failed:", err);
	}

	return result;
}
