export const INDUSTRIES = [
  'ecommerce',
  'saas',
  'blog',
  'news',
  'finance',
  'education',
  'healthcare',
  'local',
  'jobBoard',
  'realEstate',
  'restaurant',
  'portfolio',
  'media',
  'government',
  'nonprofit',
  'general',
] as const;

export type Industry = typeof INDUSTRIES[number];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  ecommerce: 'E-commerce',
  saas: 'SaaS',
  blog: 'Blog / Content',
  news: 'News / Media',
  finance: 'Finance',
  education: 'Education',
  healthcare: 'Healthcare',
  local: 'Local Business',
  jobBoard: 'Job Board',
  realEstate: 'Real Estate',
  restaurant: 'Restaurant',
  portfolio: 'Portfolio',
  media: 'Media',
  government: 'Government',
  nonprofit: 'Non-profit',
  general: 'General',
};

export const INDUSTRY_PICKER: ReadonlyArray<Industry | 'all'> = [
  'all',
  'ecommerce',
  'local',
  'saas',
  'blog',
  'news',
  'finance',
  'education',
  'healthcare',
  'realEstate',
  'jobBoard',
];
