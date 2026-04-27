import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerCompetitorsMode() {
	defineMode({
		id: 'competitors',
		description: 'Topic coverage vs competitors.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'comp_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'competitors', label: 'Competitors' }],
		actionCodes: MODE_ACTIONS.competitors,
		visible: ['p.identity.url', 'p.search.gsc.position', 'p.search.ctrGap'],
	});
}
