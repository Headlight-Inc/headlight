// packages/actions/src/catalog.ts
import type { ActionDescriptor, ActionCode } from '@headlight/types';

export const ACTIONS: Record<ActionCode, ActionDescriptor> = {
	'C01': {
		code: 'C01',
		title: 'Rewrite thin content',
		description: 'Expand pages with < 300 words to improve semantic depth.',
		modes: ['content', 'wqa', 'fullAudit'],
		severity: 'HIGH',
		effortMinutes: 45,
		impactHint: 'high',
		requires: ['p.content.wordCount'],
		capabilityRequires: [],
		triggerKey: 'content.thin',
		forecastUnit: 'clicks',
		bandHint: 'HIGH',
		units: 'page',
		autoRunCapable: true,
	},
	'T01': {
		code: 'T01',
		title: 'Fix 404 errors',
		description: 'Broken links found during crawl.',
		modes: ['technical', 'wqa', 'fullAudit'],
		severity: 'CRITICAL',
		effortMinutes: 10,
		impactHint: 'high',
		requires: ['p.indexing.status'],
		capabilityRequires: ['crawl'],
		triggerKey: 'tech.404',
		forecastUnit: 'none',
		bandHint: 'CRITICAL',
		units: 'page',
		autoRunCapable: false,
	},
    // ... 74 more would go here
};

export function getAction(code: ActionCode): ActionDescriptor | undefined {
	return ACTIONS[code];
}

export function getAllActions(): ActionDescriptor[] {
	return Object.values(ACTIONS);
}
