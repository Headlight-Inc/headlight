import { CompetitorProfile } from '../../CompetitorMatrixConfig';
import { extractNumber, parseAbbreviatedNumber } from './shared';

export interface SpyFuResult {
  estimatedOrganicTraffic: number | null;
  totalRankingKeywords: number | null;
  adsTraffic: number | null;
  adsTrafficCost: number | null;
  ppcKeywordsCount: number | null;
  brandedTrafficPct: number | null;
  topOrganicKeywords: Array<{ keyword: string; position: number; volume: number }>;
  topPaidKeywords: Array<{ keyword: string; cpc: number }>;
}

export async function scrapeSpyFu(
  domain: string,
  fetchFn: (url: string) => Promise<string> = fetch as any
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const url = `https://www.spyfu.com/overview/domain?query=${encodeURIComponent(domain)}`;

  try {
    const html = await fetchFn(url);
    const text = stripHtml(html);

    result.estimatedOrganicTraffic = extractNumber(text, 'Monthly SEO Clicks') ?? extractNumber(text, 'Organic Monthly Clicks');
    result.totalRankingKeywords = extractNumber(text, 'SEO Keywords') ?? extractNumber(text, 'Organic Keywords');
    result.adsTraffic = extractNumber(text, 'Monthly PPC Clicks') ?? extractNumber(text, 'Paid Monthly Clicks');
    result.adsTrafficCost = extractNumber(text, 'Monthly PPC Budget') ?? extractNumber(text, 'Monthly Ad Budget');
    result.ppcKeywordsCount = extractNumber(text, 'PPC Keywords') ?? extractNumber(text, 'Paid Keywords');

    const keywordData = extractKeywordTable(html);
    if (keywordData.length > 0) {
      result.topKeywords = keywordData.map((k) => ({
        keyword: k.keyword,
        position: k.position,
        volume: k.volume,
        source: 'spyfu',
      }));
      result.keywordsInTop3 = keywordData.filter((k) => k.position <= 3).length;
      result.keywordsInTop8 = keywordData.filter((k) => k.position <= 8).length;
      result.keywordsInTop10 = keywordData.filter((k) => k.position <= 10).length;
      result.keywordsInTop20 = keywordData.filter((k) => k.position <= 20).length;
      const posSum = keywordData.reduce((s, k) => s + k.position, 0);
      result.avgOrganicPosition = Math.round((posSum / keywordData.length) * 10) / 10;

      const domainRoot = domain.split('.')[0].toLowerCase();
      const branded = keywordData.filter((k) => k.keyword.toLowerCase().includes(domainRoot));
      result.brandedTrafficPct = Math.round((branded.length / keywordData.length) * 100);
    }

    const seCostMatch = text.match(/Organic.*?Value[\s\n:]*\$?([\d,\.]+[KMB]?)/i);
    if (seCostMatch) result.seTrafficCost = parseAbbreviatedNumber(seCostMatch[1]);
  } catch (err) {
    console.warn('[SpyFuScraper] Failed:', err);
  }

  return result;
}

function extractKeywordTable(html: string): Array<{ keyword: string; position: number; volume: number }> {
  const results: Array<{ keyword: string; position: number; volume: number }> = [];
  const rowPattern = /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>(\d+)<\/td>[\s\S]*?<td[^>]*>([\d,]+)<\/td>/g;
  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(html)) !== null) {
    const keyword = match[1].trim();
    const position = parseInt(match[2], 10);
    const volume = parseInt(match[3].replace(/,/g, ''), 10);
    if (keyword && !Number.isNaN(position) && position > 0 && position <= 100) {
      results.push({ keyword, position, volume: volume || 0 });
    }
  }
  return results;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
