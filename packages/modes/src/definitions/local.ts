import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerLocalMode() {
	defineMode({
		id: 'local',
		description: 'NAP consistency and local entity mapping.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'local_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'local', label: 'Local' }],
		actionCodes: MODE_ACTIONS.local,
		visible: ['p.identity.url', 'p.local.napMatchHomepage', 'p.local.hasMap'],
	});
}
