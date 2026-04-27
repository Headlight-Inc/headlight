export const CANONICAL_AUDIT_MODES = [
  'full',
  'website_quality',
  'technical_seo',
  'content',
  'on_page_seo',
  'off_page',
  'local_seo',
  'ecommerce',
  'news_editorial',
  'ai_discoverability',
  'competitor_gap',
  'business',
  'accessibility',
  'security',
] as const;

export type AuditMode = typeof CANONICAL_AUDIT_MODES[number];

export const CANONICAL_INDUSTRIES = [
  'ecommerce',
  'news',
  'blog',
  'local',
  'saas',
  'healthcare',
  'finance',
  'education',
  'realEstate',
  'restaurant',
  'portfolio',
  'jobBoard',
  'general',
] as const;

export type CanonicalIndustry = typeof CANONICAL_INDUSTRIES[number];

export const INDUSTRY_FILTER_KEYS = [
  'all',
  'local',
  'ecommerce',
  'saas',
  'blog',
  'news',
  'healthcare',
  'finance',
  'education',
  'real_estate',
  'restaurant',
] as const;

export type IndustryFilter = typeof INDUSTRY_FILTER_KEYS[number];

export type LegacyIndustry = CanonicalIndustry | 'real_estate' | 'job_board';
export type DetectedIndustry = LegacyIndustry;

export const INDUSTRY_LABELS: Record<CanonicalIndustry, string> = {
  ecommerce: 'E-commerce',
  news: 'News / Magazine',
  blog: 'Blog / Content',
  local: 'Local Business',
  saas: 'SaaS',
  healthcare: 'Healthcare',
  finance: 'Finance',
  education: 'Education',
  realEstate: 'Real Estate',
  restaurant: 'Restaurant',
  portfolio: 'Portfolio',
  jobBoard: 'Job Board',
  general: 'General',
};

export const INDUSTRY_FILTER_LABELS: Record<IndustryFilter, string> = {
  all: 'All Industries',
  local: 'Local Business',
  ecommerce: 'E-commerce',
  saas: 'SaaS',
  blog: 'Blog / Content',
  news: 'News / Media',
  healthcare: 'Healthcare',
  finance: 'Finance',
  education: 'Education',
  real_estate: 'Real Estate',
  restaurant: 'Restaurant / Food',
};

export function normalizeIndustry(industry: string | null | undefined): CanonicalIndustry {
  switch (industry) {
    case 'real_estate':
      return 'realEstate';
    case 'job_board':
      return 'jobBoard';
    case 'ecommerce':
    case 'news':
    case 'blog':
    case 'local':
    case 'saas':
    case 'healthcare':
    case 'finance':
    case 'education':
    case 'realEstate':
    case 'restaurant':
    case 'portfolio':
    case 'jobBoard':
    case 'general':
      return industry;
    default:
      return 'general';
  }
}

export function formatIndustryLabel(industry: string | null | undefined): string {
  return INDUSTRY_LABELS[normalizeIndustry(industry)];
}
