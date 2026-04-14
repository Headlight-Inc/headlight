import { CompetitorProfile } from '../../CompetitorMatrixConfig';

export async function scrapeMajestic(
  domain: string,
  fetchFn: (url: string) => Promise<string>
): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const url = `https://majestic.com/reports/site-explorer?q=${encodeURIComponent(domain)}`;

  try {
    const html = await fetchFn(url);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    const tfMatch = text.match(/Trust Flow[\s:]*(\d+)/i);
    if (tfMatch) result.majesticTrustFlow = parseInt(tfMatch[1], 10);

    const cfMatch = text.match(/Citation Flow[\s:]*(\d+)/i);
    if (cfMatch) result.majesticCitationFlow = parseInt(cfMatch[1], 10);

    const rdMatch = text.match(/Referring Domains[\s:]*([\.\d,]+)/i);
    if (rdMatch) result.referringDomains = parseInt(rdMatch[1].replace(/,/g, ''), 10);
  } catch (err) {
    console.warn('[MajesticScraper] Failed:', err);
  }

  return result;
}
