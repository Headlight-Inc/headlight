/**
 * PageDerivedFields.ts
 *
 * Lightweight computed fields derived from already-stored page data.
 * These are computed at display time (no storage needed) and at
 * enrichment time for fields that need to be action-ready.
 */

import { getCtrGap } from './ExpectedCtrCurve';
import { getTrafficPerformanceStatus } from './StrategicIntelligence';

export type ContentAge = 'fresh' | 'aging' | 'stale' | 'ancient' | null;
export type TrafficTrend = 'growing' | 'losing' | 'steady' | 'no_data';

/**
 * CTR gap: actual CTR minus expected CTR at the page's position.
 * Positive = above expected (good), negative = below expected (action needed).
 */
export function computeCtrGap(position: number | null, ctr: number | null): number | null {
  const pos = Number(position || 0);
  const actualCtr = Number(ctr || 0);
  if (pos <= 0) return null;
  return Number(getCtrGap(pos, actualCtr).toFixed(4));
}

/**
 * Traffic trend derived from sessionsDeltaPct.
 * Requires GA4 enrichment to have run.
 */
export function computeTrafficTrend(page: any): TrafficTrend {
  const delta = Number(page.sessionsDeltaPct ?? null);
  const sessions = Number(page.ga4Sessions || 0);

  if (sessions === 0 && delta === 0) return 'no_data';
  return getTrafficPerformanceStatus(page) as TrafficTrend;
}

/**
 * Impressions trend from gscImpressionsDelta (if available).
 * Falls back to 'no_data' when GSC data is missing.
 */
export function computeImpressionsTrend(page: any): TrafficTrend {
  const impressions = Number(page.gscImpressions || 0);
  if (impressions === 0) return 'no_data';

  const delta = Number(page.gscImpressionsDelta ?? null);
  if (delta === null || Number.isNaN(delta)) return 'no_data';

  if (delta > 0.15) return 'growing';
  if (delta < -0.15) return 'losing';
  return 'steady';
}

/**
 * Content age bucket from visibleDate.
 * Returns null for non-dated pages (products, homepages, etc.)
 */
export function computeContentAge(visibleDate: string | null | undefined): ContentAge {
  if (!visibleDate) return null;
  const date = new Date(visibleDate);
  if (Number.isNaN(date.getTime())) return null;
  const months = (Date.now() - date.getTime()) / (30 * 24 * 60 * 60 * 1000);
  if (months < 6) return 'fresh';
  if (months < 12) return 'aging';
  if (months < 24) return 'stale';
  return 'ancient';
}

/**
 * URL path segment only (strips protocol, host, query, hash).
 * Used for compact display in grids.
 */
export function computePagePath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname || '/';
  } catch {
    return url;
  }
}

/**
 * Apply all derived fields to a page object in one pass.
 * Call this in normalizeCrawlerPage / derivePageIntelligence.
 */
export function applyDerivedFields(page: any): any {
  return {
    ...page,
    ctrGap: page.ctrGap ?? computeCtrGap(page.gscPosition, page.gscCtr),
    trafficTrend: page.trafficTrend ?? computeTrafficTrend(page),
    impressionsTrend: page.impressionsTrend ?? computeImpressionsTrend(page),
    contentAge: page.contentAge ?? computeContentAge(page.visibleDate),
    pagePath: page.pagePath ?? computePagePath(page.url),
  };
}
