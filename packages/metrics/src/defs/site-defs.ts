import type { MetricDef } from '../../../types/src';

export const siteMetrics: MetricDef[] = [
  { key: 's.crawl.totalPages', namespace: 's.crawl', level: 'S', roles: ['G', 'I'], sources: ['T0'], format: 'number', i18nLabelKey: 'metric.s.crawl.totalPages' },
  { key: 's.crawl.coverage', namespace: 's.crawl', level: 'S', roles: ['G', 'I', 'H'], sources: ['T0'], format: 'percent', i18nLabelKey: 'metric.s.crawl.coverage' },
  { key: 's.health.score', namespace: 's.health', level: 'S', roles: ['G', 'I', 'R', 'V'], sources: ['T0'], format: 'score', i18nLabelKey: 'metric.s.health.score', scoreComponent: 'health' },
  { key: 's.commerce.productSchemaCoverage', namespace: 's.commerce', level: 'S', roles: ['H', 'I'], sources: ['T0'], format: 'percent', i18nLabelKey: 'metric.s.commerce.productSchemaCoverage', gate: { industries: ['ecommerce'] }, tags: ['legacy:productSchemaCoverage'] },
  { key: 's.commerce.reviewSchemaCoverage', namespace: 's.commerce', level: 'S', roles: ['H', 'I'], sources: ['T0'], format: 'percent', i18nLabelKey: 'metric.s.commerce.reviewSchemaCoverage', gate: { industries: ['ecommerce'] }, tags: ['legacy:reviewSchemaCoverage'] },
  { key: 's.commerce.outOfStockIndexed', namespace: 's.commerce', level: 'S', roles: ['H', 'E'], sources: ['T0'], format: 'number', i18nLabelKey: 'metric.s.commerce.outOfStockIndexed', gate: { industries: ['ecommerce'] }, tags: ['legacy:outOfStockIndexed'] },
  { key: 's.news.articleSchemaCoverage', namespace: 's.news', level: 'S', roles: ['H', 'I'], sources: ['T0'], format: 'percent', i18nLabelKey: 'metric.s.news.articleSchemaCoverage', gate: { industries: ['news', 'blog'] }, tags: ['legacy:articleSchemaCoverage'] },
  { key: 's.news.newsSitemapCoverage', namespace: 's.news', level: 'S', roles: ['H'], sources: ['T0'], format: 'percent', i18nLabelKey: 'metric.s.news.newsSitemapCoverage', gate: { industries: ['news'] }, tags: ['legacy:newsSitemapCoverage'] },
  { key: 's.news.hasRssFeed', namespace: 's.news', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.news.hasRssFeed', gate: { industries: ['news', 'blog'] }, tags: ['legacy:hasRssFeed'] },
  { key: 's.local.napConsistent', namespace: 's.local', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.local.napConsistent', gate: { industries: ['local', 'restaurant'] }, tags: ['legacy:napConsistent'] },
  { key: 's.local.hasLocalSchema', namespace: 's.local', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.local.hasLocalSchema', gate: { industries: ['local', 'restaurant'] }, tags: ['legacy:hasLocalSchema'] },
  { key: 's.local.hasGmbLink', namespace: 's.local', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.local.hasGmbLink', gate: { industries: ['local', 'restaurant'] }, tags: ['legacy:hasGmbLink'] },
  { key: 's.local.serviceAreaPageCount', namespace: 's.local', level: 'S', roles: ['I'], sources: ['T0'], format: 'number', i18nLabelKey: 'metric.s.local.serviceAreaPageCount', gate: { industries: ['local'] }, tags: ['legacy:serviceAreaPageCount'] },
  { key: 's.local.hasMenuSchema', namespace: 's.local', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.local.hasMenuSchema', gate: { industries: ['restaurant'] }, tags: ['legacy:hasMenuSchema'] },
  { key: 's.local.hasReservationLink', namespace: 's.local', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.local.hasReservationLink', gate: { industries: ['restaurant'] }, tags: ['legacy:hasReservationLink'] },
  { key: 's.saas.hasPricingPage', namespace: 's.saas', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.saas.hasPricingPage', gate: { industries: ['saas'] }, tags: ['legacy:hasPricingPage'] },
  { key: 's.saas.hasDocsSection', namespace: 's.saas', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.saas.hasDocsSection', gate: { industries: ['saas'] }, tags: ['legacy:hasDocsSection'] },
  { key: 's.saas.hasChangelog', namespace: 's.saas', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.saas.hasChangelog', gate: { industries: ['saas'] }, tags: ['legacy:hasChangelog'] },
  { key: 's.saas.hasStatusPage', namespace: 's.saas', level: 'S', roles: ['H'], sources: ['T0'], format: 'boolean', i18nLabelKey: 'metric.s.saas.hasStatusPage', gate: { industries: ['saas'] }, tags: ['legacy:hasStatusPage'] },
];
