import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerCommerceMode() {
	defineMode({
		id: 'commerce',
		description: 'Product catalog, pricing, and checkout health.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'commerce_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'commerce', label: 'Commerce' }],
		actionCodes: MODE_ACTIONS.commerce,
		visible: ['p.identity.url', 'p.commerce.price', 'p.commerce.productSchema'],
	});
}
