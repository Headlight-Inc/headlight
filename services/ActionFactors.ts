// services/ActionFactors.ts
import type { DataAvailability } from './DataAvailability';
import type { DetectedIndustry } from './SiteTypeDetector';

export type TrendDirection = 'up' | 'flat' | 'down' | 'unknown';
export type FreshnessBand = 'fresh' | 'aging' | 'stale' | 'ancient' | 'undated';
export type KeywordHealth = 'ranking_well' | 'striking_distance' | 'ranking_poor' | 'none' | 'unknown';
export type BacklinkTier  = 'strong' | 'moderate' | 'weak' | 'none' | 'unknown';
export type IntentAlign   = 'aligned' | 'misaligned' | 'unknown';

export interface ActionFactors {
  // search performance
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
  ctrGap: number;
  ctrTrend: TrendDirection;           // inferred from prev period or GSC delta
  trafficTrend: TrendDirection;
  keywordHealth: KeywordHealth;
  intentAlign: IntentAlign;
  isCannibalized: boolean;

  // authority
  backlinkTier: BacklinkTier;
  referringDomains: number;
  inlinks: number;
  ipr: number;

  // content
  freshness: FreshnessBand;
  decayRisk: number;                   // 0–100
  wordCount: number;
  readability: 'Easy' | 'Moderate' | 'Difficult' | 'Unknown';
  eeat: number | null;
  hasSchema: boolean;
  hasFaqSchema: boolean;
  selfContainedAnswers: number;

  // indexing + tech
  statusCode: number;
  indexable: boolean | null;
  inSitemap: boolean | null;
  redirectChainLength: number;
  isRedirectLoop: boolean;
  multipleCanonical: boolean;
  canonicalChain: boolean;
  mixedContent: boolean;
  sslValid: boolean | null;
  speedScore: 'Good' | 'Average' | 'Poor' | 'Unknown';
  hreflangNoReturn: boolean;

  // page context
  isHtmlPage: boolean;
  pageCategory: string;
  valueTier: '★★★' | '★★' | '★' | '·' | 'unknown';

  // data availability pass-through
  availability: DataAvailability;

  // industry
  industry: DetectedIndustry;
  industrySignals: Record<string, any>;
}

export function deriveActionFactors(page: any, ctx: {
  industry: DetectedIndustry;
  availability: DataAvailability;
}): ActionFactors {
  const position    = num(page.gscPosition);
  const impressions = num(page.gscImpressions);
  const ctr         = num(page.gscCtr);
  const sessions    = num(page.ga4Sessions);
  const sessionsDelta = num(page.sessionsDeltaPct);
  const backlinks   = num(page.backlinks);
  const referringDomains = num(page.referringDomains);

  const freshness = classifyFreshness(page.visibleDate || page.lastModified);
  const keywordHealth =
    !ctx.availability.gsc       ? 'unknown'
    : impressions === 0         ? 'none'
    : position > 0 && position <= 3   ? 'ranking_well'
    : position > 3 && position <= 20  ? 'striking_distance'
    : 'ranking_poor';

  const backlinkTier =
    !ctx.availability.backlinks ? 'unknown'
    : referringDomains >= 25    ? 'strong'
    : referringDomains >= 5     ? 'moderate'
    : referringDomains >= 1     ? 'weak'
    : 'none';

  const trafficTrend = !ctx.availability.ga4
    ? 'unknown'
    : sessionsDelta >= 10 ? 'up'
    : sessionsDelta <= -10 ? 'down'
    : 'flat';

  const ctrTrend = !ctx.availability.gsc
    ? 'unknown'
    : (page.ctrDeltaPct ?? 0) >= 10 ? 'up'
    : (page.ctrDeltaPct ?? 0) <= -10 ? 'down'
    : 'flat';

  return {
    impressions, clicks: num(page.gscClicks), position, ctr,
    ctrGap: num(page.ctrGap), ctrTrend, trafficTrend, keywordHealth,
    intentAlign: page.intentMatch ?? 'unknown',
    isCannibalized: Boolean(page.isCannibalized),
    backlinkTier, referringDomains, inlinks: num(page.inlinks), ipr: num(page.internalPageRank),
    freshness, decayRisk: num(page.contentDecayRisk),
    wordCount: num(page.wordCount),
    readability: page.readability || 'Unknown',
    eeat: page.eeatScore ?? null,
    hasSchema: (page.schemaTypes || []).length > 0,
    hasFaqSchema: Boolean(page.hasFaqSchema || (page.schemaTypes || []).includes('FAQPage')),
    selfContainedAnswers: num(page.selfContainedAnswers),
    statusCode: num(page.statusCode),
    indexable: page.indexable ?? null,
    inSitemap: page.inSitemap ?? null,
    redirectChainLength: num(page.redirectChainLength),
    isRedirectLoop: Boolean(page.isRedirectLoop),
    multipleCanonical: Boolean(page.multipleCanonical),
    canonicalChain: Boolean(page.canonicalChain),
    mixedContent: Boolean(page.mixedContent),
    sslValid: page.sslValid ?? null,
    speedScore: page.speedScore || 'Unknown',
    hreflangNoReturn: Boolean(page.hreflangNoReturn),
    isHtmlPage: Boolean(page.isHtmlPage),
    pageCategory: page.pageCategory || 'other',
    valueTier: (page.pageValueTier as any) || 'unknown',
    availability: ctx.availability,
    industry: ctx.industry,
    industrySignals: page.industrySignals || {},
  };
}

// ── helpers ──
function num(v: any): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }

function classifyFreshness(date?: string): FreshnessBand {
  if (!date) return 'undated';
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return 'undated';
  const months = (Date.now() - t) / (30 * 24 * 60 * 60 * 1000);
  if (months < 6)  return 'fresh';
  if (months < 12) return 'aging';
  if (months < 24) return 'stale';
  return 'ancient';
}
