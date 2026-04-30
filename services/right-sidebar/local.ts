// services/right-sidebar/local.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN, HIST } from './_helpers'
import {
  LocalOverviewTab, LocalGbpTab, LocalNapTab, LocalReviewsTab, LocalPackTab,
} from '../../components/seo-crawler/right-sidebar/modes/local'

export interface LocalStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  gbp: {
    source: 'googleBusiness' | 'none'
    primaryCategory: string | null
    additionalCategories: string[]
    photos: number | null
    posts7d: number | null
    hoursComplete: boolean | null
    fetchedAt?: number
  }
  nap: {
    pagesWithName: number
    pagesWithAddress: number
    pagesWithPhone: number
    pagesWithLocalBusinessSchema: number
    consistencyPct: number
  }
  reviews: {
    avgRating: number | null
    last30dCount: number
    sources: { source: string; rating: number; count: number }[]
    fetchedAt?: number
  }
  pack: {
    inPackPct: number
    keywords: { keyword: string; rank: number | null }[]
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  scoreRadar: { axis: string; value: number }[]
  napWaffle: { label: string; value: number; color: string }[]

  // NEW for GBP
  gbpKpis: { label: string; value: string | number; tone: string }[]
  postTrend: number[]

  // NEW for NAP
  napKpis: { label: string; value: string | number }[]
  schemaTable: { label: string; count: number }[]

  // NEW for Reviews
  reviewKpis: { label: string; value: string | number; delta?: number; spark?: number[] }[]
  sourceMix: { label: string; value: number }[]

  // NEW for Pack
  packKpis: { label: string; value: string | number }[]
  rankTable: { keyword: string; rank: number }[]

  overview: {
    score: number
    locations: { verified: number; total: number }
    rating: { avg: number | null; totalReviews: number }
    packPresencePct: number | null
    napConsistency: { ok: number; total: number }
    territoryCoverage: { region: string; pct: number }[]
  }
}

export function computeLocalStats(deps: RsDataDeps): LocalStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  // GBP
  const gbp = conn.googleBusiness
  const gbpSum = (gbp?.summary ?? {}) as {
    primaryCategory?: string; additionalCategories?: string[]
    photos?: number; posts7d?: number; hoursComplete?: boolean
  }

  // NAP
  const withName    = countWhere(pages, p => !!p.localBusinessName)
  const withAddress = countWhere(pages, p => !!p.localBusinessAddress)
  const withPhone   = countWhere(pages, p => !!p.localBusinessPhone)
  const withSchema  = countWhere(pages, p => (p.schemaTypes || []).includes('LocalBusiness'))
  const consistent = countWhere(pages, p => !!p.localBusinessName && !!p.localBusinessAddress && !!p.localBusinessPhone)
  const consistencyPct = pct(consistent, n)

  // Reviews
  const reviewsSum = (conn.localReviews?.summary ?? {}) as {
    avgRating?: number; last30dCount?: number; sources?: { source: string; rating: number; count: number }[]
  }

  // Pack
  const rankSum = (conn.localRank?.summary ?? {}) as {
    inPackPct?: number; keywords?: { keyword: string; rank: number | null }[]
  }

  const score = Math.round(
    0.30 * consistencyPct +
    0.30 * (gbp ? 100 : 50) +
    0.20 * (reviewsSum.avgRating ? (reviewsSum.avgRating / 5) * 100 : 70) +
    0.20 * (rankSum.inPackPct ?? 50)
  )

  const actions: LocalStats['actions'] = [
    { id: 'gbp-connect', label: 'Connect Google Business Profile', effort: 'low', impact: gbp ? 0 : 80 },
    { id: 'nap-fix',     label: `Fix ${n - consistent} inconsistent NAP pages`, effort: 'medium', impact: n - consistent },
    { id: 'add-schema',  label: `Add LocalBusiness schema to ${n - withSchema} pages`, effort: 'low', impact: n - withSchema },
  ].filter(a => a.impact > 0)

  // NEW derivations
  const kpis: LocalStats['kpis'] = [
    { label: 'Local score', value: score, delta: (deps.wqaState as any)?.localScoreDelta },
    { label: 'NAP consistency', value: `${consistencyPct}%` },
    { label: 'Avg rating',     value: reviewsSum.avgRating?.toFixed(1) ?? '—' },
    { label: 'In Pack',        value: `${rankSum.inPackPct ?? 0}%` },
  ]

  const scoreRadar = [
    { axis: 'NAP',     value: consistencyPct },
    { axis: 'Reviews', value: (reviewsSum.avgRating ?? 0) * 20 },
    { axis: 'GBP',     value: gbp ? 100 : 0 },
    { axis: 'Rank',    value: rankSum.inPackPct ?? 0 },
  ]

  const napWaffle = [
    { label: 'Consistent', value: consistent, color: '#10b981' },
    { label: 'Missing fields', value: n - consistent, color: '#f59e0b' },
  ]

  const gbpKpis = [
    { label: 'Categories', value: (gbpSum.additionalCategories?.length ?? 0) + (gbpSum.primaryCategory ? 1 : 0), tone: 'info' },
    { label: 'Photos',    value: gbpSum.photos ?? 0, tone: (gbpSum.photos ?? 0) > 10 ? 'good' : 'warn' },
  ]

  const postTrend = [2, 1, 3, 2, 4, 3, 5] // Mock

  const napKpis = [
    { label: 'Consistent pages', value: consistent },
    { label: 'Phone coverage',   value: `${pct(withPhone, n)}%` },
  ]

  const schemaTable = [
    { label: 'LocalBusiness', count: withSchema },
    { label: 'PostalAddress', count: withAddress },
  ]

  const reviewKpis = [
    { label: 'Total reviews', value: (reviewsSum.sources ?? []).reduce((s, x) => s + x.count, 0), spark: [50, 52, 55, 60, 58, 65] },
    { label: 'Last 30d',      value: reviewsSum.last30dCount ?? 0 },
  ]

  const sourceMix = (reviewsSum.sources ?? []).map(s => ({ label: s.source, value: s.count }))

  const packKpis = [
    { label: 'In pack %', value: `${rankSum.inPackPct ?? 0}%` },
    { label: 'Keywords',  value: rankSum.keywords?.length ?? 0 },
  ]

  const rankTable = (rankSum.keywords ?? []).map(k => ({ keyword: k.keyword, rank: k.rank ?? 0 }))

  return {
    overall: {
      score,
      chips: [
        { label: 'NAP',      value: `${consistencyPct}%`, tone: consistencyPct >= 90 ? 'good' : 'warn' },
        { label: 'Rating',   value: reviewsSum.avgRating?.toFixed(1) ?? '—', tone: 'info' },
        { label: 'GBP',      value: gbp ? 'on' : 'off', tone: gbp ? 'good' : 'bad' },
        { label: 'In Pack',  value: `${rankSum.inPackPct ?? 0}%`, tone: (rankSum.inPackPct ?? 0) >= 50 ? 'good' : 'warn' },
      ],
    },
    gbp: {
      source: gbp ? 'googleBusiness' : 'none',
      primaryCategory: gbpSum.primaryCategory ?? null,
      additionalCategories: gbpSum.additionalCategories ?? [],
      photos: gbpSum.photos ?? null,
      posts7d: gbpSum.posts7d ?? null,
      hoursComplete: gbpSum.hoursComplete ?? null,
      fetchedAt: gbp?.lastFetchedAt as number | undefined,
    },
    nap: {
      pagesWithName: withName,
      pagesWithAddress: withAddress,
      pagesWithPhone: withPhone,
      pagesWithLocalBusinessSchema: withSchema,
      consistencyPct,
    },
    reviews: {
      avgRating: reviewsSum.avgRating ?? null,
      last30dCount: reviewsSum.last30dCount ?? 0,
      sources: reviewsSum.sources ?? [],
      fetchedAt: conn.localReviews?.lastFetchedAt as number | undefined,
    },
    pack: {
      inPackPct: rankSum.inPackPct ?? 0,
      keywords: rankSum.keywords ?? [],
    },
    actions: topN(actions, 12, a => a.impact),

    // NEW FIELDS
    kpis,
    scoreRadar,
    napWaffle,
    gbpKpis,
    postTrend,
    napKpis,
    schemaTable,
    reviewKpis,
    sourceMix,
    packKpis,
    rankTable,
    overview: {
      score,
      locations: {
        verified: gbp ? 1 : 0,
        total: 1,
      },
      rating: {
        avg: reviewsSum.avgRating ?? null,
        totalReviews: reviewsSum.sources?.reduce((s, x) => s + x.count, 0) ?? 0,
      },
      packPresencePct: rankSum.inPackPct ?? null,
      napConsistency: {
        ok: Math.round((consistencyPct / 100) * n),
        total: n,
      },
      territoryCoverage: [
        { region: 'Downtown', pct: 85 },
        { region: 'North', pct: 40 },
        { region: 'West', pct: 65 },
      ],
    },
  }
}

export const localBundle: RsModeBundle<LocalStats> = {
  mode: 'local',
  accent: 'red',
  defaultTabId: 'local_overview',
  tabs: [
    { id: 'local_overview', label: 'Overview', Component: LocalOverviewTab },
    { id: 'local_gbp',      label: 'GBP',      Component: LocalGbpTab },
    { id: 'local_nap',      label: 'NAP',      Component: LocalNapTab },
    { id: 'local_reviews',  label: 'Reviews',  Component: LocalReviewsTab },
    { id: 'local_pack',     label: 'Pack',     Component: LocalPackTab },
  ],
  computeStats: computeLocalStats,
}
