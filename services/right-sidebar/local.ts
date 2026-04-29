// services/right-sidebar/local.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
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
}

export function computeLocalStats(deps: RsDataDeps): LocalStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  // GBP
  const gbp = conn.googleBusiness
  const gbpSum = (gbp?.summary ?? {}) as {
    primaryCategory?: string; additionalCategories?: string[]
    photos?: number; posts7d?: number; hoursComplete?: boolean
  }

  // NAP from crawl
  const withName    = countWhere(pages, p => !!p.localBusinessName)
  const withAddress = countWhere(pages, p => !!p.localBusinessAddress)
  const withPhone   = countWhere(pages, p => !!p.localBusinessPhone)
  const withSchema  = countWhere(pages, p => p.schemaTypes?.includes('LocalBusiness'))
  
  // Consistency heuristic: pages that have all 3
  const consistent = countWhere(pages, p => !!p.localBusinessName && !!p.localBusinessAddress && !!p.localBusinessPhone)
  const consistencyPct = pct(consistent, n)

  // Reviews
  const reviewsSum = (conn.localReviews?.summary ?? {}) as {
    avgRating?: number; last30dCount?: number; sources?: { source: string; rating: number; count: number }[]
  }

  // Rank / Pack
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
