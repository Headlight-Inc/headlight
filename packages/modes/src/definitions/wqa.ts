// packages/modes/src/definitions/wqa.ts
import { defineMode } from './shared';

export function registerWqaMode() {
	defineMode({
		id: 'wqa',
		description: 'Universal site quality with per-industry overlays.',
		defaultViewId: 'grid',
		views: [
			{ id: 'grid', kind: 'table', label: 'Grid', shortcut: 'g' },
			{ id: 'map',  kind: 'graph', label: 'Map',  shortcut: 'm' },
			{ id: 'reports', kind: 'reports', label: 'Reports', shortcut: 'r' },
		],
		lsSections: [
			{ id: 'wqa_overview', label: 'Overview', type: 'kpi' },
			{ id: 'wqa_actions',  label: 'Actions',  type: 'facet' },
			{ id: 'wqa_search',   label: 'Search',   type: 'facet' },
			{ id: 'wqa_content',  label: 'Content',  type: 'facet' },
			{ id: 'wqa_tech',     label: 'Technical',type: 'facet' },
			{ id: 'saved',        label: 'Saved Views', type: 'saved-views' },
		],
		rsTabs: [
			{ id: 'summary',  label: 'Summary' },
			{ id: 'actions',  label: 'Actions' },
			{ id: 'search',   label: 'Search' },
			{ id: 'tech',     label: 'Technical' },
			{ id: 'content',  label: 'Content' },
		],
		actionCodes: ['C01','C02','C03','C04','C05','C12','T01','T02','T08','L01','S01','A01'],
		industryOverlays: ['ecommerce','saas','blog','news','finance','education','healthcare','local','jobBoard','realEstate','restaurant'],
		visible: [
			'p.identity.url',
			'p.identity.category',
			'p.indexing.status',
			'p.search.gsc.impressions',
			'p.search.gsc.clicks',
			'p.search.gsc.position',
			'p.search.intentMatch',
			'p.ga4.sessions',
			'p.ga4.sessionsDeltaPct',
			'p.content.wordCount',
			'p.content.age',
			'p.score.health',
			'p.score.valueTier',
			'p.actions.primary',
			'p.actions.secondary',
			'p.actions.priority',
			'p.actions.estImpact',
		],
	});
}
