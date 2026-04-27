// packages/types/src/industries.ts

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

export const INDUSTRY_LABEL: Record<Industry, string> = {
	ecommerce: 'E-commerce',
	saas: 'SaaS',
	blog: 'Blog / Content',
	news: 'News / Magazine',
	finance: 'Finance',
	education: 'Education',
	healthcare: 'Healthcare',
	local: 'Local Business',
	jobBoard: 'Job Board',
	realEstate: 'Real Estate',
	restaurant: 'Restaurant / Food',
	portfolio: 'Portfolio',
	media: 'Media',
	government: 'Government',
	nonprofit: 'Non-profit',
	general: 'General',
};

export const INDUSTRY_ICON: Record<Industry, string> = {
	ecommerce: '🛒', saas: '💻', blog: '✍️', news: '📰',
	finance: '💰', education: '🎓', healthcare: '🏥', local: '📍',
	jobBoard: '💼', realEstate: '🏠', restaurant: '🍽️', portfolio: '🎨',
	media: '🎬', government: '🏛️', nonprofit: '🤝', general: '🌐',
};

export function isIndustry(value: unknown): value is Industry {
	return typeof value === 'string' && (INDUSTRIES as readonly string[]).includes(value);
}

export function normalizeIndustry(value: unknown): Industry {
	if (!value) return 'general';
	const k = String(value);
	if (isIndustry(k)) return k;
	// Legacy snake_case migration safety net.
	if (k === 'real_estate') return 'realEstate';
	if (k === 'job_board') return 'jobBoard';
	return 'general';
}

export function formatIndustryLabel(value: unknown): string {
	return INDUSTRY_LABEL[normalizeIndustry(value)];
}

// ─── Legacy-compat type aliases ───
export type DetectedIndustry = Industry;
export type CanonicalIndustry = Industry;
export type LegacyIndustry = Industry;
export type IndustryFilter = Industry | 'all';
export const INDUSTRY_FILTER_LABELS: Record<Industry | 'all', string> = {
  all: 'All Industries',
  ...INDUSTRY_LABEL,
};

// Legacy-compat alias
export const INDUSTRY_LABELS = INDUSTRY_LABEL;
export function allIndustries(): Industry[] {
	return [...INDUSTRIES];
}
