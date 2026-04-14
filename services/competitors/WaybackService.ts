import { CompetitorProfile } from '../CompetitorMatrixConfig';

export async function getWaybackIntelligence(domain: string): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const cleanDomain = domain.replace(/^www\./, '');

  try {
    const resp = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${cleanDomain}/*&output=json&fl=timestamp,statuscode&collapse=urlkey&limit=5000`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!resp.ok) return result;

    const data = await resp.json();
    if (!Array.isArray(data) || data.length < 2) return result;

    const rows = data.slice(1) as [string, string][];
    const okRows = rows.filter((r) => r[1] === '200');
    if (!okRows.length) return result;

    const firstTimestamp = okRows[0][0];
    const firstYear = parseInt(firstTimestamp.substring(0, 4), 10);
    const firstMonth = parseInt(firstTimestamp.substring(4, 6), 10);
    const firstDay = parseInt(firstTimestamp.substring(6, 8), 10);
    result.firstSeenDate = `${firstYear}-${String(firstMonth).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`;

    const firstDate = new Date(firstYear, firstMonth - 1, firstDay);
    result.domainAge = Math.round(((Date.now() - firstDate.getTime()) / (365.25 * 86400000)) * 10) / 10;

    const yearCounts: Record<number, Set<string>> = {};
    for (const row of okRows) {
      const year = parseInt(row[0].substring(0, 4), 10);
      if (!yearCounts[year]) yearCounts[year] = new Set();
      yearCounts[year].add(row[0]);
    }

    result.historicalGrowthCurve = Object.entries(yearCounts)
      .map(([year, set]) => ({ year: parseInt(year, 10), pages: set.size }))
      .sort((a, b) => a.year - b.year);

    result.googleIndexedPages = new Set(okRows.map((r) => r[0])).size;
  } catch {
    // ignore archive failures
  }

  return result;
}
