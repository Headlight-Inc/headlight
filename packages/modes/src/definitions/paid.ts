import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerPaidMode() {
	defineMode({
		id: 'paid',
		description: 'PPC landing page quality and ad tracking.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'paid_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'paid', label: 'Paid' }],
		actionCodes: MODE_ACTIONS.paid,
		visible: ['p.identity.url', 'p.paid.landingFromAd', 'p.ga4.conversions'],
	});
}
