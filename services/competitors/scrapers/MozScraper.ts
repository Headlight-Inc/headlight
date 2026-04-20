import { CompetitorProfile } from "../../CompetitorMatrixConfig";
import { parseAbbreviatedNumber } from "./shared";

export async function scrapeMoz(
	domain: string,
	fetchFn: (url: string) => Promise<string>,
): Promise<Partial<CompetitorProfile>> {
	const result: Partial<CompetitorProfile> = {};
	const url = `https://moz.com/domain-analysis?site=${encodeURIComponent(domain)}`;

	try {
		const html = await fetchFn(url);
		const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

		const daMatch = text.match(/Domain Authority[\s:]*(\d+)/i);
		if (daMatch) result.mozDA = parseInt(daMatch[1], 10);

		const paMatch = text.match(/Page Authority[\s:]*(\d+)/i);
		if (paMatch) result.mozPA = parseInt(paMatch[1], 10);

		const ldMatch = text.match(/Linking Domains[\s:]*([\.\d,]+[KMB]?)/i);
		if (ldMatch) result.referringDomains = parseAbbreviatedNumber(ldMatch[1]);

		const spamMatch = text.match(/Spam Score[\s:]*(\d+)/i);
		if (spamMatch) result.mozSpamScore = parseInt(spamMatch[1], 10);

		const kwMatch = text.match(/Ranking Keywords[\s:]*([\.\d,]+[KMB]?)/i);
		if (kwMatch)
			result.totalRankingKeywords = parseAbbreviatedNumber(kwMatch[1]);

		if (result.mozDA && !result.domainAuthority) {
			result.domainAuthority = result.mozDA;
		}
	} catch (err) {
		console.warn("[MozScraper] Failed:", err);
	}

	return result;
}
