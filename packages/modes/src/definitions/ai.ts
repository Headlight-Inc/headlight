import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export function registerAiMode() {
	defineMode({
		id: 'ai',
		description: 'Visibility in AI and Answer Engines.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: [{ id: 'ai_overview', label: 'Overview', type: 'kpi' }],
		rsTabs: [{ id: 'ai', label: 'AI' }],
		actionCodes: MODE_ACTIONS.ai,
		visible: ['p.identity.url', 'p.ai.passageReadiness', 'p.ai.entityCoverage'],
	});
}
