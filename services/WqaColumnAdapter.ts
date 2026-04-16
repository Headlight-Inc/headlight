/**
 * WqaColumnAdapter.ts
 *
 * Resolves WQA columns by industry and language.
 */

import type { DetectedIndustry } from './SiteTypeDetector';
import { getHiddenColumnsForLanguage } from './LanguageAdaptation';

const WQA_UNIVERSAL_COLUMNS = [
  'pageCategory',
  'url',
  'statusCode',
  'indexabilityStatus',
  'technicalAction',
  'contentAction',
  'mainKeyword',
  'mainKwPosition',
  'gscImpressions',
  'gscClicks',
  'gscCtr',
  'searchIntent',
  'ga4Sessions',
  'sessionsDeltaPct',
  'isLosingTraffic',
  'ga4BounceRate',
  'ga4EngagementTimePerPage',
  'backlinks',
  'referringDomains',
  'inlinks',
  'title',
  'h1_1',
  'wordCount',
  'contentQualityScore',
  'eeatScore',
  'pageValueTier',
  'healthScore',
  'issueCount',
  'speedScore',
  'spellingErrors',
  'grammarErrors',
  'fleschScore',
] as const;

const INDUSTRY_ADDED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  ecommerce: ['ga4EcommerceRevenue', 'ga4Transactions', 'ga4ConversionRate'],
  news: ['ga4Views', 'visibleDate', 'contentAge'],
  blog: ['ga4Views', 'ga4Subscribers', 'contentAge'],
  local: ['ga4GoalCompletions'],
  saas: ['ga4Conversions', 'ga4ConversionRate'],
  healthcare: ['hasMedicalAuthor'],
  finance: ['hasFinancialDisclaimer'],
};

const INDUSTRY_REMOVED_COLUMNS: Partial<Record<DetectedIndustry, string[]>> = {
  news: ['ga4EcommerceRevenue', 'ga4ConversionRate'],
  blog: ['ga4EcommerceRevenue', 'ga4ConversionRate'],
  local: ['ga4EcommerceRevenue'],
  education: ['ga4EcommerceRevenue'],
  healthcare: ['ga4EcommerceRevenue'],
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
    'ga4Sessions',
    'sessionsDeltaPct',
    'isLosingTraffic',
    'ga4BounceRate',
    'backlinks',
    'title',
    'wordCount',
    'contentQualityScore',
    'pageValueTier',
    'healthScore',
    'speedScore',
  ]);

  const added = INDUSTRY_ADDED_COLUMNS[industry] || [];
  if (added[0]) defaults.add(added[0]);

  return all.filter((column) => defaults.has(column));
}
