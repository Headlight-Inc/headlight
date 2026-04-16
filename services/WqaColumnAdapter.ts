/**
 * WqaColumnAdapter.ts
 *
 * Resolves WQA columns by industry and language.
 */

import type { DetectedIndustry } from './SiteTypeDetector';
import { getHiddenColumnsForLanguage } from './LanguageAdaptation';

// ─── Universal columns shown in every WQA grid ───────────────────────────────
// Ordered by strategic relevance for the WQA workflow.
// Fields removed vs old version:
//   gscClicks       → rolled into impressions tooltip
//   h1_1            → inspector only
//   spellingErrors  → inspector only (also language-gated)
//   grammarErrors   → inspector only (also language-gated)
//   fleschScore     → inspector only (also language-gated)
//   ga4EngagementTimePerPage → consolidated into ga4BounceRate display
//   referringDomains → replaced with backlinks column (rd shown in inspector)
// Fields added:
//   pagePath, ctrGap, rankingKeywords, trafficTrend, impressionsTrend,
//   contentAge, crawlDepth, internalPageRank, estimatedImpact, opportunityScore
const WQA_UNIVERSAL_COLUMNS = [
  // Identity
  'pageCategory',
  'pagePath',
  'statusCode',
  'indexabilityStatus',

  // Actions
  'technicalAction',
  'contentAction',
  'estimatedImpact',

  // Search performance
  'mainKeyword',
  'mainKwPosition',
  'rankingKeywords',
  'gscImpressions',
  'impressionsTrend',
  'ctrGap',

  // Traffic
  'ga4Sessions',
  'trafficTrend',
  'isLosingTraffic',
  'ga4BounceRate',

  // Authority
  'backlinks',
  'inlinks',
  'internalPageRank',

  // Content
  'wordCount',
  'contentAge',
  'contentQualityScore',
  'eeatScore',

  // Composite scores
  'opportunityScore',
  'pageValueTier',
  'healthScore',
  'speedScore',
  'issueCount',
] as const;

// ─── Industry-specific additions ─────────────────────────────────────────────
const INDUSTRY_ADDED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  ecommerce:   ['ga4EcommerceRevenue', 'ga4Transactions', 'ga4ConversionRate'],
  news:        ['ga4Views', 'visibleDate', 'contentAge'],      // contentAge already universal but ensure date visible
  blog:        ['ga4Views', 'contentAge'],
  local:       ['ga4GoalCompletions'],
  saas:        ['ga4Conversions', 'ga4ConversionRate'],
  healthcare:  ['hasMedicalAuthor'],
  finance:     ['hasFinancialDisclaimer'],
  real_estate: ['ga4GoalCompletions'],
  restaurant:  ['ga4GoalCompletions'],
  education:   ['ga4Conversions'],
};

// ─── Industry-specific removals ──────────────────────────────────────────────
const INDUSTRY_REMOVED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  news:        ['ga4BounceRate'],   // bounce rate is less meaningful for news/editorial
  local:       ['rankingKeywords'], // local sites rarely have keyword-rich pages
};

export function getWqaColumns(industry: DetectedIndustry, language: string): string[] {
  let columns = [...WQA_UNIVERSAL_COLUMNS];

  const added = INDUSTRY_ADDED_COLUMNS[industry] || [];
  columns = [...columns, ...added];

  const removed = new Set(INDUSTRY_REMOVED_COLUMNS[industry] || []);
  columns = columns.filter((col) => !removed.has(col));

  const langHidden = new Set(getHiddenColumnsForLanguage(language));
  columns = columns.filter((col) => !langHidden.has(col));

  return [...new Set(columns)];
}

export function getWqaDefaultVisibleColumns(industry: DetectedIndustry, language: string): string[] {
  const all = getWqaColumns(industry, language);

  const defaults = new Set([
    'pageCategory',
    'pagePath',
    'statusCode',
    'technicalAction',
    'contentAction',
    'estimatedImpact',
    'mainKeyword',
    'mainKwPosition',
    'gscImpressions',
    'impressionsTrend',
    'ctrGap',
    'ga4Sessions',
    'trafficTrend',
    'isLosingTraffic',
    'ga4BounceRate',
    'backlinks',
    'contentQualityScore',
    'contentAge',
    'opportunityScore',
    'pageValueTier',
    'healthScore',
  ]);

  // Show first industry-specific column by default
  const added = INDUSTRY_ADDED_COLUMNS[industry] || [];
  if (added[0]) defaults.add(added[0]);

  return all.filter((column) => defaults.has(column));
}
