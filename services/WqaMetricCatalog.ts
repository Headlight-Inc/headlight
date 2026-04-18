// services/WqaMetricCatalog.ts
import type { DetectedIndustry } from './SiteTypeDetector';
import type { DataAvailability } from './DataAvailability';

export type MetricSurface =
  | 'grid'          // appears as a grid column
  | 'sidebar'       // right sidebar tab value
  | 'inspector'    // bottom inspector field
  | 'site';         // site-level only (never a column)

export type MetricLevel = 'page' | 'site';

export type MetricRole =
  | 'identity'      // url, pageCategory, title
  | 'indexing'      // statusCode, indexable, canonical, sitemap
  | 'search'        // GSC metrics + intent
  | 'traffic'       // GA4 metrics
  | 'content'       // wordCount, eeat, decay, age
  | 'authority'     // backlinks, inlinks, IPR
  | 'performance'   // speedScore, cwv (consolidated)
  | 'action'        // derived actions + impact + priority
  | 'score'         // health, value, quality
  | 'industry';     // industry-specific fields

export type DataSourceGate = keyof DataAvailability; // 'gsc' | 'ga4' | 'backlinks' | ...

export interface MetricDefinition {
  key: string;                          // canonical field on the page object
  label: string;                        // UI label
  role: MetricRole;
  level: MetricLevel;
  surfaces: MetricSurface[];            // where it can render
  width?: string;                       // grid column width
  isDefault?: boolean;                  // visible in default preset
  industries?: DetectedIndustry[];      // if set, only appears for these industries
  excludeIndustries?: DetectedIndustry[];
  languages?: string[];                 // gate by ISO 639-1; empty = universal
  cms?: string[];                       // gate by CMS (wordpress, shopify, …)
  requires?: DataSourceGate[];          // requires these data sources to be available
  description?: string;
}

// ─── Canonical catalog ────────────────────────────────────────────────────────
export const WQA_METRICS: MetricDefinition[] = [
  // Identity
  { key: 'url',                    label: 'URL',                 role: 'identity', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '340px' },
  { key: 'pageCategory',           label: 'Category',            role: 'identity', level: 'page', surfaces: ['grid','sidebar','inspector'], isDefault: true, width: '120px' },
  { key: 'pageCategoryConfidence', label: 'Cat. Confidence',     role: 'identity', level: 'page', surfaces: ['grid','inspector'], width: '90px' },
  { key: 'title',                  label: 'Title',               role: 'identity', level: 'page', surfaces: ['grid','inspector'], width: '280px' },
  { key: 'language',               label: 'Language',            role: 'identity', level: 'page', surfaces: ['grid','inspector'], width: '80px' },

  // Indexing
  { key: 'statusCode',             label: 'Status',              role: 'indexing', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '70px' },
  { key: 'indexabilityStatus',     label: 'Indexability',        role: 'indexing', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '130px' },
  { key: 'inSitemap',              label: 'In Sitemap',          role: 'indexing', level: 'page', surfaces: ['grid','inspector'], width: '80px' },
  { key: 'crawlDepth',             label: 'Depth',               role: 'indexing', level: 'page', surfaces: ['grid','inspector'], width: '70px' },
  { key: 'funnelStage',            label: 'Funnel',              role: 'indexing', level: 'page', surfaces: ['grid','inspector'], width: '90px' },

  // Search (GSC-gated)
  { key: 'mainKeyword',            label: 'Main Keyword',        role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], width: '200px' },
  { key: 'mainKwPosition',         label: 'Position',            role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], isDefault: true, width: '80px' },
  { key: 'gscImpressions',         label: 'Impressions',         role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], isDefault: true, width: '100px' },
  { key: 'gscClicks',              label: 'Clicks',              role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], isDefault: true, width: '80px' },
  { key: 'gscCtr',                 label: 'CTR',                 role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], width: '70px' },
  { key: 'expectedCtr',            label: 'Exp. CTR',            role: 'search', level: 'page', surfaces: ['inspector'], requires: ['gsc'] },
  { key: 'ctrGap',                 label: 'CTR Gap',             role: 'search', level: 'page', surfaces: ['grid','inspector'], requires: ['gsc'], isDefault: true, width: '80px' },
  { key: 'searchIntent',           label: 'Intent',              role: 'search', level: 'page', surfaces: ['grid','inspector'], width: '100px' },
  { key: 'intentMatch',            label: 'Intent Match',        role: 'search', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '110px' },
  { key: 'isCannibalized',         label: 'Cannibalized',        role: 'search', level: 'page', surfaces: ['grid','inspector'], width: '100px' },

  // Traffic (GA4-gated)
  { key: 'ga4Sessions',            label: 'Sessions',            role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], isDefault: true, width: '90px' },
  { key: 'sessionsDeltaPct',       label: 'Sessions Δ%',         role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], isDefault: true, width: '100px' },
  { key: 'isLosingTraffic',        label: 'Losing Traffic',      role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], width: '100px' },
  { key: 'ga4BounceRate',          label: 'Bounce',              role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], width: '80px' },
  { key: 'ga4EngagementTimePerPage', label: 'Engagement',        role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], width: '100px' },

  // Industry-specific conversion columns (stage-gated + industry-gated)
  { key: 'ga4EcommerceRevenue',    label: 'Revenue',             role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['ecommerce'], isDefault: true, width: '100px' },
  { key: 'ga4Transactions',        label: 'Transactions',        role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['ecommerce'], width: '110px' },
  { key: 'ga4ConversionRate',      label: 'CVR',                 role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['ecommerce','saas','real_estate'], width: '80px' },
  { key: 'ga4Conversions',         label: 'Conversions',         role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['saas','real_estate'], width: '110px' },
  { key: 'ga4GoalCompletions',     label: 'Leads',               role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['local','restaurant'], isDefault: true, width: '90px' },
  { key: 'ga4Views',               label: 'Pageviews',           role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['news','blog'], isDefault: true, width: '110px' },
  { key: 'ga4Subscribers',         label: 'Subscribers',         role: 'traffic', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], industries: ['blog'], width: '110px' },

  // Content
  { key: 'wordCount',              label: 'Words',               role: 'content', level: 'page', surfaces: ['grid','inspector'], width: '80px' },
  { key: 'contentQualityScore',    label: 'Quality',             role: 'content', level: 'page', surfaces: ['grid','inspector'], width: '80px' },
  { key: 'eeatScore',              label: 'E-E-A-T',             role: 'content', level: 'page', surfaces: ['grid','inspector'], industries: ['healthcare','finance','news','blog'], width: '80px' },
  { key: 'contentAge',             label: 'Age',                 role: 'content', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '80px' },
  { key: 'visibleDate',            label: 'Published',           role: 'content', level: 'page', surfaces: ['grid','inspector'], industries: ['news','blog','restaurant'], width: '110px' },
  { key: 'contentDecayRisk',       label: 'Decay Risk',          role: 'content', level: 'page', surfaces: ['grid','inspector'], requires: ['ga4'], width: '100px' },

  // Authority
  { key: 'backlinks',              label: 'Backlinks',           role: 'authority', level: 'page', surfaces: ['grid','inspector'], requires: ['backlinks'], isDefault: true, width: '90px' },
  { key: 'referringDomains',       label: 'Ref. Domains',        role: 'authority', level: 'page', surfaces: ['grid','inspector'], requires: ['backlinks'], width: '100px' },
  { key: 'inlinks',                label: 'Inlinks',             role: 'authority', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '80px' },
  { key: 'internalPageRank',       label: 'IPR',                 role: 'authority', level: 'page', surfaces: ['grid','inspector'], width: '70px' },

  // Performance (consolidated — no raw TTFB/LCP/CLS columns)
  { key: 'speedScore',             label: 'Speed',               role: 'performance', level: 'page', surfaces: ['grid','inspector'], width: '80px' },

  // Scores
  { key: 'healthScore',            label: 'Health',              role: 'score', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '80px' },
  { key: 'pageValue',              label: 'Value',               role: 'score', level: 'page', surfaces: ['grid','inspector'], width: '80px' },
  { key: 'pageValueTier',          label: 'Tier',                role: 'score', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '70px' },
  { key: 'issueCount',             label: 'Issues',              role: 'score', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '70px' },

  // Actions
  { key: 'primaryAction',          label: 'Primary Action',      role: 'action', level: 'page', surfaces: ['grid','sidebar','inspector'], isDefault: true, width: '180px' },
  { key: 'secondaryAction',        label: 'Secondary Action',    role: 'action', level: 'page', surfaces: ['grid','inspector'], width: '180px' },
  { key: 'technicalAction',        label: 'Technical Action',    role: 'action', level: 'page', surfaces: ['grid','inspector'], width: '180px' },
  { key: 'contentAction',          label: 'Content Action',      role: 'action', level: 'page', surfaces: ['grid','inspector'], width: '180px' },
  { key: 'industryAction',         label: 'Industry Action',     role: 'action', level: 'page', surfaces: ['grid','inspector'], width: '180px' },
  { key: 'actionPriority',         label: 'Priority',            role: 'action', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '80px' },
  { key: 'estimatedImpact',        label: 'Est. Impact',         role: 'action', level: 'page', surfaces: ['grid','inspector'], isDefault: true, width: '100px' },

  // Industry-gated presence flags (grid + inspector)
  { key: 'hasMedicalAuthor',       label: 'Medical Author',      role: 'industry', level: 'page', surfaces: ['grid','inspector'], industries: ['healthcare'], width: '100px' },
  { key: 'hasFinancialDisclaimer', label: 'Disclaimer',          role: 'industry', level: 'page', surfaces: ['grid','inspector'], industries: ['finance'], width: '100px' },
  { key: 'napMatchWithHomepage',   label: 'NAP Match',           role: 'industry', level: 'page', surfaces: ['grid','inspector'], industries: ['local','restaurant'], width: '100px' },
  { key: 'inNewsSitemap',          label: 'News Sitemap',        role: 'industry', level: 'page', surfaces: ['inspector'], industries: ['news'] },

  // ─── Site-level metrics (never columns; shown in sidebar / overview only) ──
  { key: 'newsSitemapCoverage',    label: 'News Sitemap Coverage', role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['news'] },
  { key: 'articleSchemaCoverage',  label: 'Article Schema %',    role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['news','blog'] },
  { key: 'productSchemaCoverage',  label: 'Product Schema %',    role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['ecommerce'] },
  { key: 'napConsistent',          label: 'NAP Consistent',      role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['local','restaurant'] },
  { key: 'hasLocalSchema',         label: 'LocalBusiness Schema',role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['local','restaurant'] },
  { key: 'hasPricingPage',         label: 'Pricing Page',        role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['saas'] },
  { key: 'hasDocsSection',         label: 'Docs',                role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['saas'] },
  { key: 'hasStatusPage',          label: 'Status Page',         role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['saas'] },
  { key: 'hasRssFeed',             label: 'RSS Feed',            role: 'industry', level: 'site', surfaces: ['sidebar','site'], industries: ['news','blog'] },
  { key: 'wwwInconsistency',       label: 'WWW Inconsistency',   role: 'indexing', level: 'site', surfaces: ['sidebar','site'] },
];

// ─── Queries ──────────────────────────────────────────────────────────────────
export interface CatalogContext {
  industry: DetectedIndustry;
  language: string;
  cms: string | null;
  availability: DataAvailability;
  lowIndustryConfidence: boolean;
}

export function isMetricVisible(m: MetricDefinition, ctx: CatalogContext): boolean {
  if (m.industries && !m.industries.includes(ctx.industry)) return false;
  if (m.excludeIndustries && m.excludeIndustries.includes(ctx.industry)) return false;
  if (m.languages && !m.languages.includes(ctx.language)) return false;
  if (m.cms && ctx.cms && !m.cms.includes(ctx.cms)) return false;
  if (m.requires && m.requires.some((k) => !ctx.availability[k])) return false;
  // If industry confidence is low, hide industry-gated columns (fall back to universal)
  if (ctx.lowIndustryConfidence && m.industries && m.industries.length > 0) return false;
  return true;
}

export function getMetricsForSurface(surface: MetricSurface, ctx: CatalogContext): MetricDefinition[] {
  return WQA_METRICS.filter((m) => m.surfaces.includes(surface) && isMetricVisible(m, ctx));
}

export function getMetric(key: string): MetricDefinition | undefined {
  return WQA_METRICS.find((m) => m.key === key);
}
