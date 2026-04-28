import type { SidebarSection } from '../sidebar-types';
import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export const localLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'locations', kind: 'list', label: 'Locations tree', selectionMode: 'multi', selectionKey: 'local.location', defaultOpen: true, bullet: 'diamond', pinned: true,
		items: [],
		resolveItems: ({ pages }) => {
			// mock tree: USA -> NY -> Manhattan/Brooklyn
			return [
				{ id: 'usa', label: 'USA', meta: '8', children: [
					{ id: 'ny', label: 'NY', meta: '2', children: [
						{ id: 'manhattan', label: 'Manhattan', meta: '✓ ●' },
						{ id: 'brooklyn',  label: 'Brooklyn',  meta: '✓' },
					]},
					{ id: 'ca', label: 'CA', meta: '3', children: [] },
					{ id: 'tx', label: 'TX', meta: '3', children: [] },
				]},
				{ id: 'uk', label: 'UK', meta: '2', children: [] },
				{ id: 'add', label: 'Add location', icon: 'Plus', action: 'add' },
			];
		},
	},
	{ id: 'serviceAreas', kind: 'list', label: 'Service areas', bullet: 'arrow',
		items: [
			{ id: 'nyc',    label: 'NYC metro' },
			{ id: 'bay',    label: 'Bay Area' },
			{ id: 'london', label: 'London core' },
		],
	},
	{ id: 'gbpStatus', kind: 'facet', label: 'GBP status', countKey: 'local.gbpStatus', bullet: 'dot',
		buckets: [
			{ value: 'verified',  label: 'Verified',  tone: 'good' },
			{ value: 'pending',   label: 'Pending',   tone: 'warn' },
			{ value: 'suspended', label: 'Suspended', tone: 'bad'  },
			{ value: 'unclaimed', label: 'No GBP claim' },
		],
	},
	{ id: 'category', kind: 'facet', label: 'Primary category', countKey: 'local.category', bullet: 'arrow',
		buckets: [
			{ value: 'cafe',       label: 'Cafe' },
			{ value: 'restaurant', label: 'Restaurant' },
			{ value: 'retail',     label: 'Retail' },
			{ value: 'office',     label: 'Office' },
		],
	},
	{ id: 'reviewSources', kind: 'list', label: 'Review sources', selectionMode: 'multi', selectionKey: 'local.source', bullet: 'check',
		items: [
			{ id: 'google',      label: 'Google',      meta: '●', tone: 'good' },
			{ id: 'yelp',        label: 'Yelp',        meta: '●', tone: 'good' },
			{ id: 'trustpilot',  label: 'Trustpilot',  meta: '●', tone: 'good' },
			{ id: 'facebook',    label: 'Facebook' },
			{ id: 'tripadvisor', label: 'TripAdvisor' },
			{ id: 'opentable',   label: 'OpenTable' },
			{ id: 'connect',     label: 'Connect source', icon: 'Plus', action: 'connect' },
		],
	},
	{ id: 'reviewBuckets', kind: 'facet', label: 'Review buckets', countKey: 'local.reviewBucket', bullet: 'bucket',
		buckets: [
			{ value: '4.5+',   label: '4.5+',   bullet: '★' },
			{ value: '4.0',    label: '4.0-4.4', bullet: '★' },
			{ value: '3.5',    label: '3.5-3.9', bullet: '★' },
			{ value: '<3.5',   label: '<3.5',   bullet: '★' },
			{ value: 'unans',  label: 'Unanswered (<48h)', bullet: '◆' },
		],
	},
	{ id: 'napStatus', kind: 'facet', label: 'NAP / Citations', countKey: 'local.napStatus', bullet: 'bucket',
		buckets: [
			{ value: 'match',    label: 'Consistent',       bullet: '✓', tone: 'good' },
			{ value: 'mismatch', label: 'Mismatched',       bullet: '⚠', tone: 'warn' },
			{ value: 'missing',  label: 'Missing from dir', bullet: '✗', tone: 'bad'  },
		],
	},
	{ id: 'localPack', kind: 'facet', label: 'Local pack', countKey: 'local.pack', bullet: 'dot',
		buckets: [
			{ value: 'top3',     label: 'Top-3', tone: 'good' },
			{ value: '4-10',     label: '4-10' },
			{ value: 'none',     label: 'Not ranking' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Unverified GBPs',   mode: 'local', selections: { 'local.gbpStatus': ['pending', 'suspended', 'unclaimed'] } },
			{ name: 'Low ratings',       mode: 'local', selections: { 'local.reviewBucket': ['3.5', '<3.5'] } },
			{ name: 'NAP inconsistencies', mode: 'local', selections: { 'local.napStatus': ['mismatch', 'missing'] } },
		],
	},
];

export function registerLocalMode() {
	defineMode({
		id: 'local',
		description: 'NAP consistency and local entity mapping.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
				lsSections: localLsSections,
		rsTabs: [
			{ id: 'local_overview', label: 'Overview' },
			{ id: 'local_nap', label: 'NAP' },
			{ id: 'local_gbp', label: 'GBP' },
			{ id: 'local_reviews', label: 'Reviews' },
			{ id: 'local_pack', label: 'Pack' },
		],
		actionCodes: MODE_ACTIONS.local,
		visible: ['p.identity.url', 'p.local.napMatchHomepage', 'p.local.hasMap'],
	});
}
