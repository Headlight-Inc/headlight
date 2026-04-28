import type { CrawledPage } from '@/services/CrawlDatabase'
import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/paid/OverviewTab'
import { SpendTab } from '../../components/seo-crawler/right-sidebar/modes/paid/SpendTab'
import { QualityTab } from '../../components/seo-crawler/right-sidebar/modes/paid/QualityTab'
import { CompetitionTab } from '../../components/seo-crawler/right-sidebar/modes/paid/CompetitionTab'
import { ActionsTab } from '../../components/seo-crawler/right-sidebar/modes/paid/ActionsTab'

export interface PaidStats {
	totalLandingPages: number
	activeCampaigns: number
	spend30d: number
	clicks30d: number
	impressions30d: number
	ctr: number
	cpcAvg: number
	cpaAvg: number
	roas: number
	landingPageScoreAvg: number
	quality: { good: number; medium: number; poor: number }
	impressionShare: number
	impressionShareLost: { rank: number; budget: number }
	topCompetitors: Array<{ domain: string; overlap: number }>
	topActions: Array<{ id: string; label: string; impact: number; effort: 'low'|'med'|'high' }>
}

export function computePaidStats({ pages }: RsDataDeps): PaidStats {
	const total = pages.length || 1
	const sum = (pred: (p: CrawledPage) => boolean) => pages.filter(pred as any).length
	const sumOf = (sel: (p: CrawledPage) => number | undefined) =>
		pages.reduce((s, p) => s + (sel(p as any) ?? 0), 0)
	const avg = (sel: (p: CrawledPage) => number | undefined) => {
		const v = pages.map(sel as any).filter((x): x is number => typeof x === 'number')
		return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
	}

	const spend = sumOf(p => (p as any).adSpend30d)
	const clicks = sumOf(p => (p as any).adClicks30d)
	const impr = sumOf(p => (p as any).adImpressions30d)
	const conv = sumOf(p => (p as any).adConversions30d)
	const rev = sumOf(p => (p as any).adRevenue30d)

	const compMap = new Map<string, number>()
	for (const p of pages) {
		for (const c of (p as any).paidCompetitors ?? []) {
			compMap.set(c.domain, (compMap.get(c.domain) ?? 0) + (c.overlap ?? 1))
		}
	}

	const actionMap = new Map<string, { label: string; impact: number; effort: any }>()
	for (const p of pages) {
		for (const a of (p as any).recommendedActions ?? []) {
			if (a.scope !== 'paid') continue
			const e = actionMap.get(a.id) ?? { label: a.label, impact: 0, effort: a.effort ?? 'med' }
			e.impact += a.impact ?? 1
			actionMap.set(a.id, e)
		}
	}

	const lpAvg = avg(p => (p as any).landingPageScore)
	return {
		totalLandingPages: sum(p => ((p as any).adClicks30d ?? 0) > 0),
		activeCampaigns: (pages[0] as any)?.adActiveCampaigns ?? 0,
		spend30d: spend,
		clicks30d: clicks,
		impressions30d: impr,
		ctr: impr ? clicks / impr : 0,
		cpcAvg: clicks ? spend / clicks : 0,
		cpaAvg: conv ? spend / conv : 0,
		roas: spend ? rev / spend : 0,
		landingPageScoreAvg: lpAvg,
		quality: {
			good: sum(p => ((p as any).landingPageScore ?? 0) >= 80),
			medium: sum(p => ((p as any).landingPageScore ?? 0) >= 50 && ((p as any).landingPageScore ?? 0) < 80),
			poor: sum(p => ((p as any).landingPageScore ?? 0) > 0 && ((p as any).landingPageScore ?? 0) < 50),
		},
		impressionShare: avg(p => (p as any).impressionShare),
		impressionShareLost: {
			rank: avg(p => (p as any).impressionShareLostRank),
			budget: avg(p => (p as any).impressionShareLostBudget),
		},
		topCompetitors: [...compMap.entries()].map(([domain, overlap]) => ({ domain, overlap })).sort((a, b) => b.overlap - a.overlap).slice(0, 5),
		topActions: [...actionMap.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.impact - a.impact).slice(0, 5),
	}
}

export const paidBundle: RsModeBundle<PaidStats> = {
	modeId: 'paid',
	computeStats: computePaidStats,
	tabs: {
		paid_overview: OverviewTab,
		paid_spend: SpendTab,
		paid_quality: QualityTab,
		paid_competition: CompetitionTab,
		paid_actions: ActionsTab,
	},
}
