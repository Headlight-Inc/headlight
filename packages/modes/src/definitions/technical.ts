import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerTechnicalMode() {
	defineMode({
		id: 'technical',
		description: 'Core technical SEO, crawling, and indexing.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'tech_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'tech', label: 'Technical' }],
		actionCodes: MODE_ACTIONS.technical,
		visible: ['p.identity.url', 'p.indexing.status', 'p.tech.cwv.bucket'],
	});
}
