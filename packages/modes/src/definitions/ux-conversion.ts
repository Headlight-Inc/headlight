import type { SidebarSection } from '../sidebar-types';
import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export const uxConversionLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'analytics', kind: 'list', label: 'ANALYTICS SOURCES', bullet: 'square-check',
		items: [
			{ id: 'ga4',      label: 'GA4',      meta: '●', tone: 'good' },
			{ id: 'posthog',  label: 'PostHog',  meta: '●', tone: 'good' },
			{ id: 'mixpanel', label: 'Mixpanel', meta: '●', tone: 'good' },
			{ id: 'amplitude',label: 'Amplitude', meta: 'add' },
		],
	},
	{ id: 'behavior', kind: 'list', label: 'BEHAVIOR SOURCES', bullet: 'square-check',
		items: [
			{ id: 'clarity',   label: 'Microsoft Clarity', meta: '●', tone: 'good' },
			{ id: 'hotjar',    label: 'Hotjar',            meta: '●', tone: 'good' },
			{ id: 'fullstory', label: 'FullStory',         meta: 'add' },
			{ id: 'logrocket', label: 'LogRocket',         meta: 'add' },
		],
	},
	{ id: 'experimentPlatform', kind: 'list', label: 'EXPERIMENT PLATFORM', bullet: 'square-check',
		items: [
			{ id: 'optimizely', label: 'Optimizely', meta: '●', tone: 'good' },
			{ id: 'vwo',         label: 'VWO',        meta: 'add' },
			{ id: 'growthbook',  label: 'GrowthBook', meta: 'add' },
			{ id: 'statsig',     label: 'Statsig',    meta: 'add' },
		],
	},
	{ id: 'pageRole', kind: 'list', label: 'PAGE ROLE', bullet: 'arrow',
		items: [
			{ id: 'entry',      label: 'Entry',      meta: '128' },
			{ id: 'mid-funnel', label: 'Mid-funnel', meta: '164' },
			{ id: 'conversion', label: 'Conversion', meta: '42' },
			{ id: 'form',       label: 'Form',       meta: '22' },
			{ id: 'confirm',    label: 'Confirm',    meta: '18' },
			{ id: 'utility',    label: 'Utility',    meta: '28' },
		],
	},
	{ id: 'intent', kind: 'list', label: 'INTENT BUCKETS', bullet: 'dot-filled',
		items: [
			{ id: 'converters', label: 'Converters', meta: '88' },
			{ id: 'researchers',label: 'Researchers', meta: '182' },
			{ id: 'bouncers',   label: 'Bouncers',    meta: '112' },
			{ id: 'returning',  label: 'Returning',   meta: '62' },
		],
	},
	{ id: 'device', kind: 'list', label: 'DEVICE', bullet: 'arrow',
		items: [
			{ id: 'mobile',  label: 'Mobile',  meta: '62%' },
			{ id: 'desktop', label: 'Desktop', meta: '32%' },
			{ id: 'tablet',  label: 'Tablet',  meta: '6%' },
		],
	},
	{ id: 'friction', kind: 'list', label: 'FRICTION SIGNALS', bullet: 'dot',
		items: [
			{ id: 'rage',   label: 'Rage clicks', tone: 'bad',  meta: '142' },
			{ id: 'dead',   label: 'Dead clicks', tone: 'warn', meta: '212' },
			{ id: 'error',  label: 'Error clicks', tone: 'bad',  meta: '88' },
			{ id: 'uturn',  label: 'U-turns',      meta: '64' },
			{ id: 'scroll', label: 'Scroll dead',  meta: '42' },
			{ id: 'form',   label: 'Form errors',  meta: '88' },
		],
	},
	{ id: 'cwv', kind: 'list', label: 'CWV ON CONVERTERS', bullet: 'dot',
		items: [
			{ id: 'lcp-good', label: 'LCP good', meta: '218', tone: 'good' },
			{ id: 'lcp-poor', label: 'LCP poor', meta: '42',  tone: 'bad'  },
			{ id: 'inp-poor', label: 'INP poor', meta: '22',  tone: 'bad'  },
			{ id: 'cls-poor', label: 'CLS poor', meta: '14',  tone: 'bad'  },
		],
	},
	{ id: 'experimentStatus', kind: 'list', label: 'EXPERIMENTS', bullet: 'dot',
		items: [
			{ id: 'running',   label: 'Running',       meta: '4',  tone: 'info' },
			{ id: 'winning',   label: 'Winning',       meta: '6',  tone: 'good' },
			{ id: 'losing',    label: 'Losing',        meta: '4',  tone: 'bad'  },
			{ id: 'inconclusive', label: 'Inconclusive', meta: '12' },
		],
	},
	{ id: 'funnels', kind: 'list', label: 'FUNNELS', bullet: 'arrow',
		items: [
			{ id: 'signup', label: 'Signup',       meta: '6 steps' },
			{ id: 'purchase',label: 'Purchase',     meta: '5 steps' },
			{ id: 'demo',   label: 'Demo request',  meta: '4 steps' },
			{ id: 'new',    label: 'New funnel',    action: 'add', icon: 'Plus' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Rage + converter',    mode: 'uxConversion', selections: { friction: ['rage'], intent: ['converters'] } },
			{ name: 'Form abandon > 50%',   mode: 'uxConversion', selections: { friction: ['form'] } },
			{ name: 'Mobile bounce hot',   mode: 'uxConversion', selections: { device: ['mobile'], intent: ['bouncers'] } },
		],
	},
];

export function registerUxConversionMode() {
	defineMode({
		id: 'uxConversion',
		description: 'User experience and conversion rate optimization.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
				lsSections: uxConversionLsSections,
		rsTabs: [{ id: 'ux', label: 'UX' }],
		actionCodes: MODE_ACTIONS.uxConversion,
		visible: ['p.identity.url', 'p.ux.ctaCount', 'p.ga4.sessions'],
	});
}
