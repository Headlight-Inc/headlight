/**
 * WqaColumnAdapter.ts
 *
 * Resolves WQA columns by industry and language.
 */

import type { DetectedIndustry } from './SiteTypeDetector';
import { getHiddenColumnsForLanguage } from './LanguageAdaptation';

const WQA_UNIVERSAL_COLUMNS = [
  // Identity
  'pageCategory',
  'url',
  'statusCode',
  'indexabilityStatus',
  // Actions
  'technicalAction',
  'contentAction',
  'industryAction',       // NEW: primary industry-specific action (from getIndustryActions)
  'estimatedImpact',
  'actionPriority',
  // Search performance
  'mainKeyword',
  'mainKwPosition',
  'gscImpressions',
  'gscClicks',
  'gscCtr',
  'expectedCtr',          // NEW: benchmark CTR at current position
  'ctrGap',               // NEW: actual minus expected CTR (negative = underperforming)
  'searchIntent',
  'intentMatch',          // NEW: 'aligned' | 'misaligned' | 'unknown'
  // Traffic
  'ga4Sessions',
  'sessionsDeltaPct',
  'isLosingTraffic',
  'ga4BounceRate',
  'ga4EngagementTimePerPage',
  // Authority
  'backlinks',
  'referringDomains',
  'inlinks',
  'internalPageRank',     // NEW: internal page rank score 0–100
  // Content
  'title',
  'h1_1',
  'wordCount',
  'contentQualityScore',
  'eeatScore',
  'contentAge',           // NEW (moved from news/blog-only to universal)
  'isCannibalized',       // NEW: boolean flag from cannibalization detection
  // Quality scores
  'pageValueTier',
  'pageValue',            // NEW: numeric value score 0–100 (not just tier)
  'healthScore',
  'issueCount',
  'speedScore',
  // Language-dependent (hidden automatically for non-supported languages)
  'spellingErrors',
  'grammarErrors',
  'fleschScore',
] as const;

const INDUSTRY_ADDED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  ecommerce: ['ga4EcommerceRevenue', 'ga4Transactions', 'ga4ConversionRate'],
  // contentAge removed from news/blog — now in universal
  news: ['ga4Views', 'visibleDate'],
  blog: ['ga4Views', 'ga4Subscribers'],
  local: ['ga4GoalCompletions'],
  saas: ['ga4Conversions', 'ga4ConversionRate'],
  healthcare: ['hasMedicalAuthor'],
  finance: ['hasFinancialDisclaimer'],
  // NEW
  real_estate: ['ga4Conversions', 'ga4ConversionRate'],
  restaurant: ['ga4GoalCompletions', 'visibleDate'],
};

const INDUSTRY_REMOVED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  news: ['ga4EcommerceRevenue', 'ga4ConversionRate'],
  blog: ['ga4EcommerceRevenue', 'ga4ConversionRate'],
  local: ['ga4EcommerceRevenue'],
  education: ['ga4EcommerceRevenue'],
  healthcare: ['ga4EcommerceRevenue'],
  real_estate: [],
  restaurant: ['ga4EcommerceRevenue'],
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
    'url',
    'statusCode',
    'indexabilityStatus',
    'technicalAction',
    'contentAction',
    'mainKeyword',
    'mainKwPosition',
    'gscImpressions',
    'ctrGap',             // NEW default: most actionable search signal
    'ga4Sessions',
    'sessionsDeltaPct',
    'isLosingTraffic',
    'ga4BounceRate',
    'backlinks',
    'title',
    'wordCount',
    'contentQualityScore',
    'intentMatch',        // NEW default: reveals content-keyword alignment
    'contentAge',         // NEW default: surfaces stale content immediately
    'pageValueTier',
    'healthScore',
    'speedScore',
  ]);

  // Always show the first industry-specific column as default too
  const added = INDUSTRY_ADDED_COLUMNS[industry] || [];
  if (added[0]) defaults.add(added[0]);

  return all.filter((column) => defaults.has(column));
}
