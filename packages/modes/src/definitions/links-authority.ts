import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerLinksAuthorityMode() {
	defineMode({
		id: 'linksAuthority',
		description: 'Backlink profile and internal link structure.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'links_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'links', label: 'Links' }],
		actionCodes: MODE_ACTIONS.linksAuthority,
		visible: ['p.identity.url', 'p.links.backlinks', 'p.links.authorityScore'],
	});
}
