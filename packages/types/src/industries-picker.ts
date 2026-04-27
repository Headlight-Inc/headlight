// packages/types/src/industries-picker.ts
import { type Industry, INDUSTRY_LABEL, INDUSTRY_ICON } from './industries';

export interface IndustryPickerEntry {
	id: Industry;
	label: string;
	icon: string;
	description: string;
	checkPackHint: string;
}

export const INDUSTRY_PICKER: IndustryPickerEntry[] = [
	{ id: 'ecommerce',  label: INDUSTRY_LABEL.ecommerce,  icon: INDUSTRY_ICON.ecommerce,  description: 'Product catalog and checkout sites',  checkPackHint: '+ product / catalog / pricing checks' },
	{ id: 'saas',       label: INDUSTRY_LABEL.saas,       icon: INDUSTRY_ICON.saas,       description: 'Software products and platforms',     checkPackHint: '+ docs / pricing / onboarding checks' },
	{ id: 'blog',       label: INDUSTRY_LABEL.blog,       icon: INDUSTRY_ICON.blog,       description: 'Editorial and knowledge content',     checkPackHint: '+ freshness / author / topic checks' },
	{ id: 'news',       label: INDUSTRY_LABEL.news,       icon: INDUSTRY_ICON.news,       description: 'Publishing-heavy news sites',         checkPackHint: '+ article schema / recency checks' },
	{ id: 'finance',    label: INDUSTRY_LABEL.finance,    icon: INDUSTRY_ICON.finance,    description: 'Financial advice and fintech',        checkPackHint: '+ compliance / freshness checks' },
	{ id: 'education',  label: INDUSTRY_LABEL.education,  icon: INDUSTRY_ICON.education,  description: 'Schools, LMS, and course sites',      checkPackHint: '+ course / structure checks' },
	{ id: 'healthcare', label: INDUSTRY_LABEL.healthcare, icon: INDUSTRY_ICON.healthcare, description: 'Medical and wellness',                checkPackHint: '+ author trust / medical checks' },
	{ id: 'local',      label: INDUSTRY_LABEL.local,      icon: INDUSTRY_ICON.local,      description: 'Local services and store sites',      checkPackHint: '+ NAP / map pack / GMB checks' },
	{ id: 'jobBoard',   label: INDUSTRY_LABEL.jobBoard,   icon: INDUSTRY_ICON.jobBoard,   description: 'Listings and ATS-driven sites',       checkPackHint: '+ JobPosting schema checks' },
	{ id: 'realEstate', label: INDUSTRY_LABEL.realEstate, icon: INDUSTRY_ICON.realEstate, description: 'Listings and brokerage platforms',    checkPackHint: '+ listing / local intent checks' },
	{ id: 'restaurant', label: INDUSTRY_LABEL.restaurant, icon: INDUSTRY_ICON.restaurant, description: 'Menu and reservation sites',          checkPackHint: '+ menu / local entity checks' },
];

export const INDUSTRY_PICKER_IDS: ReadonlyArray<Industry> = INDUSTRY_PICKER.map((e) => e.id);
