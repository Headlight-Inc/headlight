/**
 * MetricRoles.ts
 *
 * Defines visibility and behavior roles for WQA columns.
 * Helps the UI decide which columns to show by default and how to group them.
 */

export type MetricRole =
  | 'technical'   // Core SEO hygiene (status, indexability, titles)
  | 'performance' // Speed, CWV, DOM metrics
  | 'content'     // Word count, language, intent, clusters
  | 'metrics'     // GSC/GA4 traffic and value data
  | 'business'    // Lead forms, trust signals, ad platforms
  | 'industry';   // Industry-specific (Ecommerce, SaaS, etc.)

export interface ColumnRoleConfig {
  key: string;
  role: MetricRole;
  isPriority?: boolean;    // Shown by default in "Basic" view
  cmsSpecific?: string[];  // Only show if website is built on this CMS
  industrySpecific?: string[];
}

export const METRIC_ROLES: ColumnRoleConfig[] = [
  // Technical
  { key: 'status', role: 'technical', isPriority: true },
  { key: 'indexabilityStatus', role: 'technical', isPriority: true },
  { key: 'title', role: 'technical', isPriority: true },
  { key: 'metaDesc', role: 'technical', isPriority: true },
  { key: 'canonical', role: 'technical' },
  { key: 'h1_1', role: 'technical' },
  { key: 'robots', role: 'technical' },

  // Performance
  { key: 'speedScore', role: 'performance', isPriority: true },
  { key: 'lcp', role: 'performance' },
  { key: 'cls', role: 'performance' },
  { key: 'domNodeCount', role: 'performance' },

  // Content
  { key: 'wordCount', role: 'content', isPriority: true },
  { key: 'pageCategory', role: 'content', isPriority: true },
  { key: 'language', role: 'content' },
  { key: 'topicCluster', role: 'content' },
  { key: 'searchIntent', role: 'content' },

  // Metrics
  { key: 'gscClicks', role: 'metrics', isPriority: true },
  { key: 'gscImpressions', role: 'metrics' },
  { key: 'gscPosition', role: 'metrics', isPriority: true },
  { key: 'pageValue', role: 'metrics', isPriority: true },
  { key: 'ga4Sessions', role: 'metrics' },

  // Business
  { key: 'hasForms', role: 'business' },
  { key: 'exposedEmails', role: 'business' },
  { key: 'hasTrustBadges', role: 'business' },

  // CMS Specific
  { key: 'wpPublishDate', role: 'industry', cmsSpecific: ['WordPress'] },
  { key: 'shopifyProductType', role: 'industry', cmsSpecific: ['Shopify'] },
  { key: 'webflowCollection', role: 'industry', cmsSpecific: ['Webflow'] },
];

export function getDefaultVisibleColumns(industry: string, cms: string | null): string[] {
  const defaults = METRIC_ROLES.filter(r => r.isPriority).map(r => r.key);
  
  // Add CMS specific ones
  if (cms) {
    const cmsCols = METRIC_ROLES.filter(r => r.cmsSpecific?.includes(cms)).map(r => r.key);
    defaults.push(...cmsCols);
  }

  // Add industry specific ones if defined
  const indCols = METRIC_ROLES.filter(r => r.industrySpecific?.includes(industry)).map(r => r.key);
  defaults.push(...indCols);

  return Array.from(new Set(defaults));
}
