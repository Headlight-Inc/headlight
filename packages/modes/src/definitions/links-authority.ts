import type { SidebarSection } from '../sidebar-types';
import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export const linksAuthorityLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'sources', kind: 'list', label: 'SOURCES', bullet: 'square-check', pinned: true,
		items: [
			{ id: 'ahrefs',   label: 'Ahrefs',   indicator: 'dot', tone: 'good' },
			{ id: 'majestic', label: 'Majestic', indicator: 'dot', tone: 'good' },
			{ id: 'csv',      label: 'Upload CSV', indicator: 'dot', tone: 'good' },
			{ id: 'gsc',      label: 'GSC link report' },
			{ id: 'add',      label: 'Add provider', action: 'add', icon: 'Plus' },
		],
	},
	{ id: 'linkType', kind: 'list', label: 'LINK TYPE', bullet: 'arrow',
		items: [
			{ id: 'internal', label: 'Internal',      meta: '8,420' },
			{ id: 'ext-out',  label: 'External out',  meta: '240' },
			{ id: 'backlink', label: 'Backlinks (in)', meta: '14,820' },
			{ id: 'redirect', label: 'Redirected',    meta: '92' },
			{ id: 'broken',   label: 'Broken (404)',  meta: '38' },
		],
	},
	{ id: 'refDomains', kind: 'list', label: 'REF DOMAINS', bullet: 'check',
		items: [
			{ id: 'dr90',   label: 'DR 90+', meta: '12' },
			{ id: 'dr70-89', label: 'DR 70-89', meta: '48' },
			{ id: 'dr40-69', label: 'DR 40-69', meta: '212' },
			{ id: 'dr-lt40', label: 'DR <40', meta: '680' },
			{ id: 'unique',  label: 'Unique', meta: '952' },
		],
	},
	{ id: 'anchorClasses', kind: 'list', label: 'ANCHOR CLASSES', bullet: 'dot',
		items: [
			{ id: 'brand',   label: 'Brand',         meta: '62%' },
			{ id: 'exact',   label: 'Exact match',   meta: '4%' },
			{ id: 'partial', label: 'Partial',       meta: '18%' },
			{ id: 'generic', label: 'Generic',       meta: '9%' },
			{ id: 'url',     label: 'URL',           meta: '6%' },
			{ id: 'image',   label: 'Image / no-text', meta: '1%' },
		],
	},
	{ id: 'attributes', kind: 'facet', label: 'ATTRIBUTES', countKey: 'links.attribute', bullet: 'check',
		buckets: [
			{ value: 'dofollow',  label: 'dofollow' },
			{ value: 'nofollow',  label: 'nofollow' },
			{ value: 'ugc',       label: 'UGC' },
			{ value: 'sponsored', label: 'Sponsored' },
		],
	},
	{ id: 'toxicity', kind: 'list', label: 'TOXICITY', bullet: 'dot',
		items: [
			{ id: 'toxic',      label: 'Toxic',      meta: '62',  tone: 'bad' },
			{ id: 'suspicious', label: 'Suspicious', meta: '148', tone: 'warn' },
			{ id: 'low-quality', label: 'Low-quality', meta: '412' },
			{ id: 'clean',      label: 'Clean',      meta: '14,198', tone: 'good' },
		],
	},
	{ id: 'orphansDepth', kind: 'list', label: 'ORPHANS & DEPTH', bullet: 'check',
		items: [
			{ id: 'orphan', label: 'Orphan pages', meta: '26' },
			{ id: 'deep',   label: 'Depth >5',     meta: '42' },
			{ id: 'hub',    label: 'Hub pages',     meta: '18' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Lost in 30d',         mode: 'linksAuthority', selections: { linkType: ['broken'] } },
			{ name: 'Toxic w/ exact kw',   mode: 'linksAuthority', selections: { toxicity: ['toxic'], anchorClasses: ['exact'] } },
			{ name: 'DR90+ unclaimed',     mode: 'linksAuthority', selections: { refDomains: ['dr90'] } },
		],
	},
];

export function registerLinksAuthorityMode() {
	defineMode({
		id: 'linksAuthority',
		description: 'Backlink profile and internal link structure.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
		lsSections: linksAuthorityLsSections,
		rsTabs: [{ id: 'links', label: 'Links' }],
		actionCodes: MODE_ACTIONS.linksAuthority,
		visible: ['p.identity.url', 'p.links.backlinks', 'p.links.authorityScore'],
	});
}
