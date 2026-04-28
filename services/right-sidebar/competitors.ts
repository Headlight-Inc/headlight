import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/competitors/OverviewTab'
import { GapsTab } from '../../components/seo-crawler/right-sidebar/modes/competitors/GapsTab'
import { WinsTab } from '../../components/seo-crawler/right-sidebar/modes/competitors/WinsTab'
import { LossesTab } from '../../components/seo-crawler/right-sidebar/modes/competitors/LossesTab'
import { BacklinkOverlapTab } from '../../components/seo-crawler/right-sidebar/modes/competitors/BacklinkOverlapTab'

export interface CompetitorsStats {
	trackedCompetitors: Array<{ domain: string; visibility: number; deltaPct: number }>
	visibilityIndex: number
	visibilityDelta30d: number
	sharedKeywords: number
	gapKeywords: Array<{ keyword: string; volume: number; competitorRank: number; ourRank?: number }>
	wins: Array<{ keyword: string; deltaPositions: number; volume: number }>
	losses: Array<{ keyword: string; deltaPositions: number; volume: number }>
	backlinkOverlap: Array<{ domain: string; sharedDomains: number; uniqueToCompetitor: number }>
	topOpportunityDomains: Array<{ domain: string; potential: number }>
}

export function computeCompetitorsStats({ pages }: RsDataDeps): CompetitorsStats {
	const comp = (pages[0] as any)?.competitiveSnapshot
	return {
		trackedCompetitors: comp?.competitors ?? [],
		visibilityIndex: comp?.visibilityIndex ?? 0,
		visibilityDelta30d: comp?.visibilityDelta30d ?? 0,
		sharedKeywords: comp?.sharedKeywords ?? 0,
		gapKeywords: (comp?.gapKeywords ?? []).slice(0, 6),
		wins: (comp?.wins ?? []).slice(0, 5),
		losses: (comp?.losses ?? []).slice(0, 5),
		backlinkOverlap: comp?.backlinkOverlap ?? [],
		topOpportunityDomains: comp?.opportunityDomains ?? [],
	}
}

export const competitorsBundle: RsModeBundle<CompetitorsStats> = {
	modeId: 'competitors',
	computeStats: computeCompetitorsStats,
	tabs: {
		comp_overview: OverviewTab,
		comp_gaps: GapsTab,
		comp_wins: WinsTab,
		comp_losses: LossesTab,
		comp_backlinks: BacklinkOverlapTab,
	},
}
