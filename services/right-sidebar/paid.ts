// services/right-sidebar/paid.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
import {
  PaidOverviewTab, PaidSpendTab, PaidQualityTab, PaidCompetitionTab, PaidActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/paid'

export interface PaidStats {
  source: 'googleAds' | 'metaAds' | 'none'
  fetchedAt?: number
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  spend: {
    last7dSpend: number | null
    last30dSpend: number | null
    projectedMonthSpend: number | null
    cpa: number | null
    roas: number | null
    spendByCampaign: { campaign: string; spend: number }[]
    dailyTrend: number[]    // last 14 days
  }
  quality: {
    avgQualityScore: number | null
    landingPageScoreAvg: number
    slowLandingPages: number
    mobileLandingPages: number
    landingPagesTotal: number
  }
  competition: {
    impressionSharePct: number | null
    topOfPagePct: number | null
    auctionInsights: { domain: string; overlapPct: number }[]
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
}

export function computePaidStats(deps: RsDataDeps): PaidStats {
  const pages = deps.pages
  const conn = deps.integrationConnections
  const ads  = conn.googleAds ?? conn.metaAds
  const source: PaidStats['source'] =
    conn.googleAds ? 'googleAds' : conn.metaAds ? 'metaAds' : 'none'
  const sum = (ads?.summary ?? {}) as {
    last7dSpend?: number; last30dSpend?: number; projectedMonthSpend?: number
    cpa?: number; roas?: number; avgQualityScore?: number
    impressionSharePct?: number; topOfPagePct?: number
    spendByCampaign?: { campaign: string; spend: number }[]
    dailyTrend?: number[]
    auctionInsights?: { domain: string; overlapPct: number }[]
    landingUrls?: string[]
  }

  // Landing-page quality from crawled pages (always available)
  const landingUrls = new Set<string>(sum.landingUrls ?? [])
  const lps = landingUrls.size > 0 ? pages.filter(p => landingUrls.has(p.url)) : pages
  const lpsTotal = lps.length
  const slowLPs   = countWhere(lps, p => (p.loadTime ?? 0) > 2500)
  const mobileLPs = countWhere(lps, p => !!p.mobileFriendly)
  const lpScoreAvg = lpsTotal === 0 ? 0 : Math.round(
    lps.reduce((s, p) => {
      const speed = (p.loadTime ?? 3000) <= 2500 ? 100 : 50
      const mobile = p.mobileFriendly ? 100 : 0
      const cwv = (p.lcpMs ?? 3000) <= 2500 ? 100 : 0
      return s + (speed + mobile + cwv) / 3
    }, 0) / lpsTotal
  )

  // Score (weighted)
  const score = Math.round(
    0.40 * (sum.avgQualityScore != null ? Math.min(100, (sum.avgQualityScore / 10) * 100) : lpScoreAvg) +
    0.30 * lpScoreAvg +
    0.30 * (sum.impressionSharePct ?? 50)
  )

  const actions: PaidStats['actions'] = [
    { id: 'lp-speed',    label: `Speed up ${slowLPs} slow landing pages`,           effort: 'high',   impact: slowLPs },
    { id: 'lp-mobile',   label: `Make ${lpsTotal - mobileLPs} LPs mobile-friendly`,  effort: 'medium', impact: lpsTotal - mobileLPs },
  ].filter(a => a.impact > 0)

  return {
    source,
    fetchedAt: ads?.lastFetchedAt as number | undefined,
    overall: {
      score,
      chips: [
        { label: 'QS',    value: sum.avgQualityScore != null ? `${sum.avgQualityScore.toFixed(1)}/10` : '—', tone: 'info' },
        { label: 'CPA',   value: sum.cpa != null ? `$${sum.cpa.toFixed(2)}` : '—',                          tone: 'info' },
        { label: 'ROAS',  value: sum.roas != null ? `${sum.roas.toFixed(2)}x` : '—',                        tone: sum.roas != null && sum.roas >= 2 ? 'good' : 'warn' },
        { label: 'IS',    value: sum.impressionSharePct != null ? `${sum.impressionSharePct}%` : '—',       tone: 'info' },
      ],
    },
    spend: {
      last7dSpend: sum.last7dSpend ?? null,
      last30dSpend: sum.last30dSpend ?? null,
      projectedMonthSpend: sum.projectedMonthSpend ?? null,
      cpa: sum.cpa ?? null,
      roas: sum.roas ?? null,
      spendByCampaign: sum.spendByCampaign ?? [],
      dailyTrend: sum.dailyTrend ?? [],
    },
    quality: {
      avgQualityScore: sum.avgQualityScore ?? null,
      landingPageScoreAvg: lpScoreAvg,
      slowLandingPages: slowLPs,
      mobileLandingPages: mobileLPs,
      landingPagesTotal: lpsTotal,
    },
    competition: {
      impressionSharePct: sum.impressionSharePct ?? null,
      topOfPagePct: sum.topOfPagePct ?? null,
      auctionInsights: sum.auctionInsights ?? [],
    },
    actions,
  }
}

export const paidBundle: RsModeBundle<PaidStats> = {
  mode: 'paid',
  accent: 'cyan',
  defaultTabId: 'paid_overview',
  tabs: [
    { id: 'paid_overview',    label: 'Overview',    Component: PaidOverviewTab },
    { id: 'paid_spend',       label: 'Spend',       Component: PaidSpendTab },
    { id: 'paid_quality',     label: 'Quality',     Component: PaidQualityTab },
    { id: 'paid_competition', label: 'Competition', Component: PaidCompetitionTab },
    { id: 'paid_actions',     label: 'Actions',     Component: PaidActionsTab },
  ],
  computeStats: computePaidStats,
}
