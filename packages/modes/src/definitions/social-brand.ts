import type { SidebarSection } from '../sidebar-types';
import { defineMode } from './shared';
import { MODE_ACTIONS } from './_mode-action-map';

export const socialBrandLsSections: ReadonlyArray<SidebarSection> = [
	{ id: 'profiles', kind: 'list', label: 'PROFILES (9)', bullet: 'square-check', pinned: true,
		items: [
			{ id: 'linkedin',  label: 'LinkedIn',    meta: '14.2k', tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'x',         label: 'X (Twitter)', meta: '12.8k', tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'meta',      label: 'Meta (FB)',   meta: '8.4k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'instagram', label: 'Instagram',   meta: '6.2k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'tiktok',    label: 'TikTok',      meta: '3.8k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'youtube',   label: 'YouTube',     meta: '2.4k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'pinterest', label: 'Pinterest',   meta: '0.8k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'threads',   label: 'Threads',     meta: '0.4k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'bluesky',   label: 'Bluesky',     meta: '0.2k',  tone: 'good', metaStyle: 'badge', indicator: 'dot' },
			{ id: 'add',       label: 'Add profile', action: 'add', icon: 'Plus' },
		],
	},
	{ id: 'contentType', kind: 'list', label: 'CONTENT TYPE', bullet: 'arrow',
		items: [
			{ id: 'text',     label: 'Text / thread',      meta: '242' },
			{ id: 'image',    label: 'Image',              meta: '218' },
			{ id: 'video-l',  label: 'Video (long)',       meta: '22' },
			{ id: 'video-s',  label: 'Video (short/reel)', meta: '142' },
			{ id: 'carousel', label: 'Carousel',           meta: '62' },
			{ id: 'live',     label: 'Live',               meta: '4' },
			{ id: 'story',    label: 'Story/ephemeral',    meta: '132' },
			{ id: 'ugc',      label: 'UGC repost',         meta: '18' },
		],
	},
	{ id: 'postStatus', kind: 'list', label: 'POST STATUS', bullet: 'dot',
		items: [
			{ id: 'published', label: 'Published', meta: '840', tone: 'good' },
			{ id: 'scheduled', label: 'Scheduled', meta: '28',  tone: 'info' },
			{ id: 'draft',     label: 'Draft',     meta: '14' },
			{ id: 'failed',    label: 'Failed',    meta: '2',   tone: 'bad'  },
		],
	},
	{ id: 'campaign', kind: 'list', label: 'CAMPAIGN / CALENDAR', bullet: 'arrow',
		items: [
			{ id: 'launches',   label: 'Product launches',    meta: '6' },
			{ id: 'leadership', label: 'Thought leadership', meta: '42' },
			{ id: 'community',  label: 'Community',           meta: '88' },
			{ id: 'recruiting', label: 'Recruiting',          meta: '12' },
			{ id: 'pr',         label: 'PR',                  meta: '18' },
		],
	},
	{ id: 'mentions', kind: 'list', label: 'MENTIONS FILTER', bullet: 'diamond',
		items: [
			{ id: 'positive',  label: 'Positive',            meta: '752', tone: 'good' },
			{ id: 'neutral',   label: 'Neutral',             meta: '342' },
			{ id: 'negative',  label: 'Negative',            meta: '120', tone: 'bad'  },
			{ id: 'questions', label: 'Questions',           meta: '48',  tone: 'info' },
			{ id: 'compared',  label: 'Competitor compared', meta: '142', tone: 'warn' },
			{ id: 'crisis',    label: 'Crisis signal',       meta: '4',   tone: 'bad'  },
		],
	},
	{ id: 'influencer', kind: 'list', label: 'INFLUENCER TIER', bullet: 'dot-filled',
		items: [
			{ id: 'mega',  label: 'Mega (>1M)',       meta: '4' },
			{ id: 'macro', label: 'Macro (100k-1M)',  meta: '22' },
			{ id: 'mid',   label: 'Mid (10k-100k)',   meta: '88' },
			{ id: 'micro', label: 'Micro (1k-10k)',   meta: '312' },
			{ id: 'nano',  label: 'Nano (<1k)',       meta: '788' },
		],
	},
	{ id: 'hashtags', kind: 'list', label: 'HASHTAGS / TOPICS', bullet: 'bucket',
		items: [
			{ id: 'crm',        label: 'crm',        meta: '214', bullet: '#' },
			{ id: 'saas',       label: 'saas',       meta: '142', bullet: '#' },
			{ id: 'sales',      label: 'sales',      meta: '88',  bullet: '#' },
			{ id: 'automation', label: 'automation', meta: '62',  bullet: '#' },
		],
	},
	{ id: 'utm', kind: 'list', label: 'UTM / TRAFFIC SOURCES', bullet: 'arrow',
		items: [
			{ id: 'organic', label: 'social-organic',  meta: '2,418' },
			{ id: 'paid',    label: 'social-paid',     meta: '1,214' },
			{ id: 'referral',label: 'referral-social', meta: '578' },
		],
	},
	{ id: 'savedViews', kind: 'saved-views', label: 'Saved views',
		defaultViews: [
			{ name: 'Negative mentions',   mode: 'socialBrand', selections: { mentions: ['negative'] } },
			{ name: 'Scheduled this wk',   mode: 'socialBrand', selections: { postStatus: ['scheduled'] } },
			{ name: 'OG issues + traffic',  mode: 'socialBrand', selections: { utm: ['organic', 'paid'] } },
		],
	},
];

export function registerSocialBrandMode() {
	defineMode({
		id: 'socialBrand',
		description: 'Social signals and brand mentions.',
		defaultViewId: 'grid',
		views: [{ id: 'grid', kind: 'table', label: 'Grid' }],
				lsSections: socialBrandLsSections,
		rsTabs: [{ id: 'social', label: 'Social' }],
		actionCodes: MODE_ACTIONS.socialBrand,
		visible: ['p.identity.url', 'p.social.ogPresent', 'p.social.brandMentions'],
	});
}
