import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerSocialBrandMode() {
	defineMode({
		id: 'socialBrand',
		description: 'Social signals and brand mentions.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'social_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'social', label: 'Social' }],
		actionCodes: MODE_ACTIONS.socialBrand,
		visible: ['p.identity.url', 'p.social.ogPresent', 'p.social.brandMentions'],
	});
}
