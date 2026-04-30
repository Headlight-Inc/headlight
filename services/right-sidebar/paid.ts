import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { PaidOverviewTab, PaidSpendTab, PaidQualityTab, PaidCompetitionTab, PaidActionsTab } from '../../components/seo-crawler/right-sidebar/modes/paid'

export interface PaidStats {
  source: 'googleAds' | 'metaAds' | 'tiktokAds' | 'mixed' | 'none'
  overview: { spend30d: number | null; conversions30d: number | null; roas: number | null; cpa: number | null; impressionShare: number | null; deviceMix: { mobile: number; desktop: number; tablet: number } }
  spend: { byChannel: ReadonlyArray<{ channel: string; amount: number }>; byCampaign: ReadonlyArray<{ name: string; amount: number; conversions: number; cpa: number }>; trend: ReadonlyArray<number> }
  quality: { qualityScoreAvg: number | null; ctrAvg: number | null; lpExperience: 'aboveAvg' | 'avg' | 'belowAvg' | null; cwvPassRate: number; lpExp: ReadonlyArray<{ url: string; lcpMs: number | null; cls: number | null; tone: 'good' | 'warn' | 'bad' }> }
  competition: { auctionInsights: ReadonlyArray<{ competitor: string; impressionShare: number; positionAboveRate: number }>; cpcVsBenchmark: number | null }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computePaidStats(deps: RsDataDeps): PaidStats {
  const conn = deps.integrationConnections ?? {}
  const ga = conn.googleAds, fb = conn.metaAds, tt = conn.tiktokAds
  const source: PaidStats['source'] = ga && fb ? 'mixed' : ga ? 'googleAds' : fb ? 'metaAds' : tt ? 'tiktokAds' : 'none'
  const sum = ((ga ?? fb ?? tt)?.summary ?? {}) as any

  const lpExp = (deps.pages ?? []).filter(p => p?.adLandingPage).slice(0, 5).map(p => ({
    url: p.url,
    lcpMs: p.lcp ?? null,
    cls:   p.cls ?? null,
    tone:  ((p.lcp ?? 0) <= 2500 && (p.cls ?? 0) <= 0.1 ? 'good' : (p.lcp ?? 0) <= 4000 ? 'warn' : 'bad') as const,
  }))
  const cwvPass = lpExp.filter(x => x.tone === 'good').length

  const actions: RsAction[] = []
  if (sum.qualityScoreAvg != null && sum.qualityScoreAvg < 5) actions.push({ id: 'qs',   label: `Improve QS (avg ${sum.qualityScoreAvg.toFixed(1)})`, severity: 'highLeverage', effort: 'med', impact: 70 })
  if (lpExp.some(x => x.tone === 'bad')) actions.push({ id: 'lp',   label: `Fix slow ad landing pages`, severity: 'revenueLoss', effort: 'med', impact: 75 })
  if (sum.impressionShare != null && sum.impressionShare < 0.5) actions.push({ id: 'is', label: `Increase impression share (${Math.round(sum.impressionShare * 100)}%)`, severity: 'strategic', effort: 'med', impact: 50 })
  if (sum.cpaTrend === 'rising') actions.push({ id: 'cpa', label: 'CPA rising — audit campaigns', severity: 'highLeverage', effort: 'med', impact: 60 })

  return {
    source,
    overview: {
      spend30d:        sum.spend30d        ?? null,
      conversions30d:  sum.conversions30d  ?? null,
      roas:            sum.roas            ?? null,
      cpa:             sum.cpa             ?? null,
      impressionShare: sum.impressionShare ?? null,
      deviceMix:       sum.deviceMix       ?? { mobile: 0, desktop: 0, tablet: 0 },
    },
    spend: {
      byChannel:  sum.byChannel  ?? [],
      byCampaign: (sum.topCampaigns ?? []).slice(0, 6),
      trend:      sum.spendTrend  ?? [],
    },
    quality: {
      qualityScoreAvg: sum.qualityScoreAvg ?? null,
      ctrAvg:          sum.ctrAvg          ?? null,
      lpExperience:    sum.lpExperience    ?? null,
      cwvPassRate:     lpExp.length ? Math.round((cwvPass / lpExp.length) * 100) : 0,
      lpExp,
    },
    competition: {
      auctionInsights: sum.auctionInsights ?? [],
      cpcVsBenchmark:  sum.cpcVsBenchmark  ?? null,
    },
    actions,
    fetchedAt: (ga ?? fb ?? tt)?.lastFetchedAt,
  }
}

export const paidBundle: RsModeBundle<PaidStats> = {
  mode: 'paid', accent: 'cyan', defaultTabId: 'paid_overview',
  tabs: [
    { id: 'paid_overview',    label: 'Overview',    Component: PaidOverviewTab },
    { id: 'paid_spend',       label: 'Spend',       Component: PaidSpendTab },
    { id: 'paid_quality',     label: 'Quality',     Component: PaidQualityTab },
    { id: 'paid_competition', label: 'Competition', Component: PaidCompetitionTab },
    { id: 'paid_actions',     label: 'Actions',     Component: PaidActionsTab },
  ],
  computeStats: computePaidStats,
}
