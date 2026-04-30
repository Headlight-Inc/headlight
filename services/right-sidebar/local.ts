import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { LocalOverviewTab, LocalNapTab, LocalGbpTab, LocalReviewsTab, LocalPackTab } from '../../components/seo-crawler/right-sidebar/modes/local'

export interface LocalStats {
  source: 'gbp' | 'crawler' | 'partial' | 'none'
  overview: { rating: number | null; reviews: number | null; gbpVerified: boolean; napConsistencyPct: number; topKeyword: string | null; pack3Pct: number | null }
  nap: { consistencyPct: number; mismatches: ReadonlyArray<{ url: string; field: 'name' | 'address' | 'phone' }>; pagesWithoutNap: number }
  gbp: { name: string | null; categoryPrimary: string | null; categories: ReadonlyArray<string>; hoursComplete: boolean; postsLast30: number; photosCount: number; verified: boolean; phone: string | null; website: string | null }
  reviews: { count: number | null; rating: number | null; recent30: ReadonlyArray<{ rating: number; date: string }>; responseRate: number | null; topKeywords: ReadonlyArray<string> }
  pack: { keywordsTracked: number; pack3Count: number; pack3Pct: number | null; movers: ReadonlyArray<{ keyword: string; delta: number }> }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeLocalStats(deps: RsDataDeps): LocalStats {
  const pages = deps.pages ?? []
  const conn = deps.integrationConnections ?? {}
  const gbp = conn.googleBusiness, br = conn.brightlocal
  const sum = ((gbp ?? br)?.summary ?? {}) as any
  const source: LocalStats['source'] = gbp && br ? 'gbp' : gbp ? 'gbp' : br ? 'partial' : pages.length ? 'crawler' : 'none'

  const napPages = pages.filter(p => p?.napDetected === true).length
  const napTotal = Math.max(1, pages.length)
  const napConsistency = sum.napConsistencyPct ?? Math.round((napPages / napTotal) * 100)
  const napMismatches = sum.napMismatches ?? []
  const pagesWithoutNap = napTotal - napPages

  const actions: RsAction[] = []
  if (gbp && !sum.verified) actions.push({ id: 'verify', label: 'Verify Google Business Profile', severity: 'blocking',     effort: 'low', impact: 90 })
  if (napConsistency < 90)  actions.push({ id: 'nap',    label: 'Fix NAP inconsistencies',         severity: 'highLeverage', effort: 'med', impact: 70 })
  if ((sum.responseRate ?? 1) < 0.5) actions.push({ id: 'resp', label: 'Respond to recent reviews', severity: 'highLeverage', effort: 'low', impact: 60 })
  if ((sum.postsLast30 ?? 0) < 4) actions.push({ id: 'posts', label: 'Publish weekly GBP posts',    severity: 'strategic',    effort: 'low', impact: 30 })

  return {
    source,
    overview: {
      rating:            sum.rating  ?? null,
      reviews:           sum.reviews ?? null,
      gbpVerified:       !!sum.verified,
      napConsistencyPct: napConsistency,
      topKeyword:        sum.topKeyword ?? null,
      pack3Pct:          sum.pack3Pct  ?? null,
    },
    nap: { consistencyPct: napConsistency, mismatches: napMismatches, pagesWithoutNap },
    gbp: {
      name: sum.name ?? null,
      categoryPrimary: sum.categoryPrimary ?? null,
      categories: sum.categories ?? [],
      hoursComplete: !!sum.hoursComplete,
      postsLast30: sum.postsLast30 ?? 0,
      photosCount: sum.photosCount ?? 0,
      verified: !!sum.verified,
      phone: sum.phone ?? null,
      website: sum.website ?? null,
    },
    reviews: {
      count: sum.reviews ?? null,
      rating: sum.rating ?? null,
      recent30: sum.recentReviews ?? [],
      responseRate: sum.responseRate ?? null,
      topKeywords: sum.reviewKeywords ?? [],
    },
    pack: {
      keywordsTracked: sum.keywordsTracked ?? 0,
      pack3Count: sum.pack3Count ?? 0,
      pack3Pct: sum.pack3Pct ?? null,
      movers: sum.packMovers ?? [],
    },
    actions,
    fetchedAt: (gbp ?? br)?.lastFetchedAt,
  }
}

export const localBundle: RsModeBundle<LocalStats> = {
  mode: 'local', accent: 'orange', defaultTabId: 'local_overview',
  tabs: [
    { id: 'local_overview', label: 'Overview',   Component: LocalOverviewTab },
    { id: 'local_nap',      label: 'NAP',        Component: LocalNapTab },
    { id: 'local_gbp',      label: 'GBP',        Component: LocalGbpTab },
    { id: 'local_reviews',  label: 'Reviews',    Component: LocalReviewsTab },
    { id: 'local_pack',     label: 'Local Pack', Component: LocalPackTab },
  ],
  computeStats: computeLocalStats,
}
