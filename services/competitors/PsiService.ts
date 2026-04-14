import { CompetitorProfile } from '../CompetitorMatrixConfig';

const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function getPageSpeedData(domain: string, userApiKey?: string): Promise<Partial<CompetitorProfile>> {
  const result: Partial<CompetitorProfile> = {};
  const url = `https://${domain}`;

  for (const strategy of ['mobile', 'desktop'] as const) {
    try {
      const params = new URLSearchParams({
        url,
        strategy,
        category: 'performance',
        ...(userApiKey ? { key: userApiKey } : {}),
      });

      const resp = await fetch(`${PSI_BASE}?${params}`, {
        signal: AbortSignal.timeout(30000),
      });
      if (!resp.ok) continue;

      const data = await resp.json();
      const perfScore = data.lighthouseResult?.categories?.performance?.score;
      if (perfScore !== undefined && strategy === 'mobile') {
        result.siteSpeedScore = Math.round(perfScore * 100);
      }

      const crux = data.loadingExperience;
      if (crux?.metrics) {
        const lcp = crux.metrics.LARGEST_CONTENTFUL_PAINT_MS;
        const cls = crux.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE;
        const inp = crux.metrics.INTERACTION_TO_NEXT_PAINT;

        let passing = 0;
        let total = 0;
        if (lcp) {
          total++;
          if ((lcp.percentile || 0) <= 2500) passing++;
        }
        if (cls) {
          total++;
          if ((cls.percentile || 0) <= 10) passing++;
        }
        if (inp) {
          total++;
          if ((inp.percentile || 0) <= 200) passing++;
        }
        if (total > 0) result.cwvPassRate = Math.round((passing / total) * 100);
      }

      if (strategy === 'mobile') {
        const accessScore = data.lighthouseResult?.categories?.accessibility?.score;
        if (accessScore !== undefined) {
          result.mobileFriendlinessScore = Math.round(accessScore * 100);
        }
      }

      if (strategy === 'mobile' && result.siteSpeedScore != null) break;
    } catch {
      // continue with other strategy
    }
  }

  return result;
}

export function computeCompositeSpeedScore(crawlData: {
  ttfb?: number;
  lcp?: number;
  cls?: number;
  pageSize?: number;
  hasCompression?: boolean;
  httpVersion?: string;
}): number {
  let score = 100;

  if (crawlData.ttfb) {
    if (crawlData.ttfb > 1500) score -= 30;
    else if (crawlData.ttfb > 800) score -= 15;
    else if (crawlData.ttfb > 400) score -= 5;
  }

  if (crawlData.lcp) {
    if (crawlData.lcp > 4000) score -= 25;
    else if (crawlData.lcp > 2500) score -= 15;
    else if (crawlData.lcp > 1500) score -= 5;
  }

  if (crawlData.cls !== undefined) {
    if (crawlData.cls > 0.25) score -= 15;
    else if (crawlData.cls > 0.1) score -= 8;
  }

  if (crawlData.pageSize) {
    const mb = crawlData.pageSize / (1024 * 1024);
    if (mb > 5) score -= 20;
    else if (mb > 2) score -= 10;
    else if (mb > 1) score -= 5;
  }

  if (!crawlData.hasCompression) score -= 10;
  if (crawlData.httpVersion === '1.1') score -= 5;

  return Math.max(0, Math.min(100, score));
}
