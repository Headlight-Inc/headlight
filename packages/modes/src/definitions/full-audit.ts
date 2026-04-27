import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerFullAuditMode() {
	defineMode({
		id: 'fullAudit',
		description: 'The complete SEO audit including all checks and metrics.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'summary', label: 'Summary' }],
		actionCodes: MODE_ACTIONS.fullAudit,
		visible: ['p.identity.url', 'p.score.health'],
	});
}
