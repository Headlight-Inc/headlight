import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerUxConversionMode() {
	defineMode({
		id: 'uxConversion',
		description: 'User experience and conversion rate optimization.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'ux_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'ux', label: 'UX' }],
		actionCodes: MODE_ACTIONS.uxConversion,
		visible: ['p.identity.url', 'p.ux.ctaCount', 'p.ga4.sessions'],
	});
}
