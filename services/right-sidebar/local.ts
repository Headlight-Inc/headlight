import type { CrawledPage } from '@/services/CrawlDatabase'
import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/local/OverviewTab'
import { NapTab } from '../../components/seo-crawler/right-sidebar/modes/local/NapTab'
import { GbpTab } from '../../components/seo-crawler/right-sidebar/modes/local/GbpTab'
import { ReviewsTab } from '../../components/seo-crawler/right-sidebar/modes/local/ReviewsTab'
import { LocalPackTab } from '../../components/seo-crawler/right-sidebar/modes/local/LocalPackTab'

export interface LocalStats {
	locations: number
	napConsistency: number
	napMismatches: Array<{ field: 'name'|'address'|'phone'; sources: ReadonlyArray<string>; count: number }>
	localBusinessSchemaRate: number
	gbp: {
		profiles: number
		verified: number
		suspended: number
		photosAvg: number
		postsLast30d: number
		qaUnanswered: number
	}
	reviews: {
		total: number
		avgRating: number
		last30: number
		responseRate: number
		negativeUnanswered: number
	}
	localPack: {
		appearances: number
		avgRank: number
		topKeywords: Array<{ keyword: string; rank: number; volume: number }>
	}
}

export function computeLocalStats({ pages }: RsDataDeps): LocalStats {
	const total = pages.length || 1
	const sum = (pred: (p: CrawledPage) => boolean) => pages.filter(pred as any).length
	const hasSchema = (kind: string) => sum(p => ((p as any).schemaTypes ?? []).includes(kind))

	const napMap = new Map<string, { sources: Set<string>; count: number }>()
	for (const p of pages) {
		for (const m of (p as any).napMismatches ?? []) {
			const key = m.field
			const e = napMap.get(key) ?? { sources: new Set(), count: 0 }
			m.sources.forEach((s: string) => e.sources.add(s))
			e.count += 1
			napMap.set(key, e)
		}
	}

	const gbp = (pages[0] as any)?.gbp
	const rev = (pages[0] as any)?.localReviews
	const pack = (pages[0] as any)?.localPack

	return {
		locations: (pages[0] as any)?.localLocations ?? 0,
		napConsistency: (pages[0] as any)?.napConsistencyScore ?? 0,
		napMismatches: [...napMap.entries()].map(([field, v]) => ({ field: field as any, sources: [...v.sources], count: v.count })),
		localBusinessSchemaRate: hasSchema('LocalBusiness') / total,
		gbp: {
			profiles: gbp?.profiles ?? 0,
			verified: gbp?.verified ?? 0,
			suspended: gbp?.suspended ?? 0,
			photosAvg: gbp?.photosAvg ?? 0,
			postsLast30d: gbp?.postsLast30d ?? 0,
			qaUnanswered: gbp?.qaUnanswered ?? 0,
		},
		reviews: {
			total: rev?.total ?? 0,
			avgRating: rev?.avgRating ?? 0,
			last30: rev?.last30 ?? 0,
			responseRate: rev?.responseRate ?? 0,
			negativeUnanswered: rev?.negativeUnanswered ?? 0,
		},
		localPack: {
			appearances: pack?.appearances ?? 0,
			avgRank: pack?.avgRank ?? 0,
			topKeywords: (pack?.topKeywords ?? []).slice(0, 5),
		},
	}
}

export const localBundle: RsModeBundle<LocalStats> = {
	modeId: 'local',
	computeStats: computeLocalStats,
	tabs: {
		local_overview: OverviewTab,
		local_nap: NapTab,
		local_gbp: GbpTab,
		local_reviews: ReviewsTab,
		local_pack: LocalPackTab,
	},
}
