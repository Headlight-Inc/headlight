import type { CrawledPage } from '@/services/CrawlDatabase'
import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/social/OverviewTab'
import { MentionsTab } from '../../components/seo-crawler/right-sidebar/modes/social/MentionsTab'
import { EngagementTab } from '../../components/seo-crawler/right-sidebar/modes/social/EngagementTab'
import { TrafficTab } from '../../components/seo-crawler/right-sidebar/modes/social/TrafficTab'
import { ActionsTab } from '../../components/seo-crawler/right-sidebar/modes/social/ActionsTab'

export interface SocialStats {
	shareOfVoice: number
	mentions30d: number
	mentionsTrend: ReadonlyArray<number>
	sentiment: { positive: number; neutral: number; negative: number }
	topChannels: Array<{ channel: string; mentions: number; engagementRate: number }>
	followers: { facebook: number; instagram: number; tiktok: number; x: number; youtube: number; linkedin: number }
	avgEngagementRate: number
	socialSessions30d: number
	socialConversions30d: number
	socialReferrers: Array<{ host: string; sessions: number }>
	topActions: Array<{ id: string; label: string; impact: number; effort: 'low'|'med'|'high' }>
}

export function computeSocialStats({ pages }: RsDataDeps): SocialStats {
	const sumOf = (sel: (p: CrawledPage) => number | undefined) =>
		pages.reduce((s, p) => s + (sel(p as any) ?? 0), 0)
	const avg = (sel: (p: CrawledPage) => number | undefined) => {
		const v = pages.map(sel as any).filter((x): x is number => typeof x === 'number')
		return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
	}

	const channelMap = new Map<string, { mentions: number; engSum: number; engN: number }>()
	let pos = 0, neu = 0, neg = 0
	for (const p of pages) {
		for (const m of (p as any).socialMentions ?? []) {
			const e = channelMap.get(m.channel) ?? { mentions: 0, engSum: 0, engN: 0 }
			e.mentions += 1
			if (typeof m.engagementRate === 'number') { e.engSum += m.engagementRate; e.engN += 1 }
			channelMap.set(m.channel, e)
			if (m.sentiment === 'positive') pos += 1
			else if (m.sentiment === 'negative') neg += 1
			else neu += 1
		}
	}

	const refMap = new Map<string, number>()
	for (const p of pages) {
		for (const r of (p as any).socialReferrers ?? []) {
			refMap.set(r.host, (refMap.get(r.host) ?? 0) + (r.sessions ?? 0))
		}
	}

	const actionMap = new Map<string, { label: string; impact: number; effort: any }>()
	for (const p of pages) {
		for (const a of (p as any).recommendedActions ?? []) {
			if (a.scope !== 'social') continue
			const e = actionMap.get(a.id) ?? { label: a.label, impact: 0, effort: a.effort ?? 'med' }
			e.impact += a.impact ?? 1
			actionMap.set(a.id, e)
		}
	}

	return {
		shareOfVoice: avg(p => (p as any).shareOfVoice),
		mentions30d: sumOf(p => (p as any).socialMentions30d),
		mentionsTrend: (pages[0] as any)?.socialMentionsTrend ?? [],
		sentiment: { positive: pos, neutral: neu, negative: neg },
		topChannels: [...channelMap.entries()]
			.map(([channel, v]) => ({ channel, mentions: v.mentions, engagementRate: v.engN ? v.engSum / v.engN : 0 }))
			.sort((a, b) => b.mentions - a.mentions)
			.slice(0, 5),
		followers: {
			facebook: (pages[0] as any)?.socialFollowers?.facebook ?? 0,
			instagram: (pages[0] as any)?.socialFollowers?.instagram ?? 0,
			tiktok: (pages[0] as any)?.socialFollowers?.tiktok ?? 0,
			x: (pages[0] as any)?.socialFollowers?.x ?? 0,
			youtube: (pages[0] as any)?.socialFollowers?.youtube ?? 0,
			linkedin: (pages[0] as any)?.socialFollowers?.linkedin ?? 0,
		},
		avgEngagementRate: avg(p => (p as any).socialEngagementRate),
		socialSessions30d: sumOf(p => (p as any).socialSessions30d),
		socialConversions30d: sumOf(p => (p as any).socialConversions30d),
		socialReferrers: [...refMap.entries()].map(([host, sessions]) => ({ host, sessions })).sort((a, b) => b.sessions - a.sessions).slice(0, 5),
		topActions: [...actionMap.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.impact - a.impact).slice(0, 5),
	}
}

export const socialBundle: RsModeBundle<SocialStats> = {
	modeId: 'socialBrand',
	computeStats: computeSocialStats,
	tabs: {
		social_overview: OverviewTab,
		social_mentions: MentionsTab,
		social_engagement: EngagementTab,
		social_traffic: TrafficTab,
		social_actions: ActionsTab,
	},
}
