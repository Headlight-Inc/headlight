import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerContentMode() {
	defineMode({
		id: 'content',
		description: 'Content quality, age, and semantic richness.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'content_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'content', label: 'Content' }],
		actionCodes: MODE_ACTIONS.content,
		visible: ['p.identity.url', 'p.content.wordCount', 'p.content.age'],
	});
}
