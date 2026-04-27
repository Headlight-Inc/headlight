// packages/types/src/industries-legacy.ts
import { type Industry } from './industries';

/** @deprecated Resolves snake_case + legacy aliases to the canonical Industry. */
export const LEGACY_INDUSTRY_MAP: Record<string, Industry> = {
	ecommerce: 'ecommerce',
	saas: 'saas',
	blog: 'blog',
	news: 'news',
	finance: 'finance',
	education: 'education',
	healthcare: 'healthcare',
	local: 'local',
	real_estate: 'realEstate',
	job_board: 'jobBoard',
	restaurant: 'restaurant',
	portfolio: 'portfolio',
	media: 'media',
	government: 'government',
	nonprofit: 'nonprofit',
	general: 'general',
};

export const INDUSTRY_SET: Record<Industry, true> = {
    ecommerce: true,
    saas: true,
    blog: true,
    news: true,
    finance: true,
    education: true,
    healthcare: true,
    local: true,
    jobBoard: true,
    realEstate: true,
    restaurant: true,
    portfolio: true,
    media: true,
    government: true,
    nonprofit: true,
    general: true,
};
