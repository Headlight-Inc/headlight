// services/right-sidebar/socialBrand.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN, HIST } from './_helpers'
import {
  SocialOverviewTab, SocialMentionsTab, SocialEngagementTab, SocialTrafficTab, SocialActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/social'

export interface SocialBrandStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  meta: {
    pagesWithOgTitle: number
    pagesWithOgImage: number
    pagesWithTwitterCard: number
    ogTitleCoveragePct: number
    ogImageCoveragePct: number
    twitterCardCoveragePct: number
    sharerLinksDetected: number
  }
  mentions: { source: 'brandwatch'|'meltwater'|'none'; volume7d: number | null; topSources: { domain: string; count: number }[]; fetchedAt?: number }
  engagement: {
    accounts: { network: 'twitter'|'facebook'|'instagram'|'linkedin'|'tiktok'|'youtube'; handle: string; followers: number | null }[]
    last7dPosts: number | null
    avgEngagementRate: number | null
  }
  traffic: {
    ga4Source: boolean
    last30dSocialSessions: number | null
    topNetworks: { network: string; sessions: number }[]
    fetchedAt?: number
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  networkWaffle: { label: string; value: number; color: string }[]

  // NEW for Mentions
  mentionKpis: { label: string; value: string | number; delta?: number; spark?: number[] }[]
  sentimentMix: { label: string; value: number }[]

  // NEW for Engagement
  engagementKpis: { label: string; value: string | number }[]
  followerTable: { network: string; followers: number }[]

  trafficKpis: { label: string; value: string | number }[]
  trafficBySource: { label: string; count: number }[]

  overview: {
    followersTotal: number
    mentions30d: number | null
    sentiment: number | null
    engagementRatePct: number | null
    socialTraffic: { sessions: number; sitePctOfTotal: number }
    sovPct: number | null
    topPostThisWeek?: { platform: string; preview: string }
    alerts: { label: string; tone: 'good'|'warn'|'bad' }[]
  }
}

export function computeSocialBrandStats(deps: RsDataDeps): SocialBrandStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const ogTitle = countWhere(pages, p => !!p.ogTitle)
  const ogImage = countWhere(pages, p => !!p.ogImage)
  const twCard  = countWhere(pages, p => !!p.twitterCard)
  const sharer  = countWhere(pages, p => /(twitter\.com\/share|facebook\.com\/sharer|linkedin\.com\/share)/.test((p as any).outboundLinkRefs?.join(' ') || ''))

  const mentionsSource: SocialBrandStats['mentions']['source'] =
    conn.brandwatch ? 'brandwatch' : conn.meltwater ? 'meltwater' : 'none'
  const mentionsConn = conn.brandwatch ?? conn.meltwater
  const mentionsSummary = (mentionsConn?.summary ?? {}) as { volume7d?: number; topSources?: { domain: string; count: number }[] }

  const accounts = ((conn.socialAccounts?.summary ?? {}) as { accounts?: SocialBrandStats['engagement']['accounts'] }).accounts ?? []
  const last7dPosts = (conn.socialAccounts?.summary as { last7dPosts?: number } | undefined)?.last7dPosts ?? null
  const avgEng = (conn.socialAccounts?.summary as { avgEngagementRate?: number } | undefined)?.avgEngagementRate ?? null

  const ga4 = conn.ga4
  const ga4Sum = (ga4?.summary ?? {}) as { last30dSocialSessions?: number; topSocialNetworks?: { network: string; sessions: number }[] }

  const ogCovPct = pct(ogTitle, n)
  const ogImgCovPct = pct(ogImage, n)
  const twCovPct = pct(twCard, n)

  const score = Math.round(
    0.40 * ogCovPct +
    0.30 * ogImgCovPct +
    0.20 * twCovPct +
    0.10 * (sharer > 0 ? 100 : 50)
  )

  const actions: SocialBrandStats['actions'] = [
    { id: 'add-og-title', label: `Add OG title to ${n - ogTitle} pages`,    effort: 'low', impact: n - ogTitle },
    { id: 'add-og-image', label: `Add OG image to ${n - ogImage} pages`,    effort: 'medium', impact: n - ogImage },
    { id: 'add-tw-card',  label: `Add Twitter card to ${n - twCard} pages`, effort: 'low', impact: n - twCard },
  ].filter(a => a.impact > 0)

  // NEW derivations
  const kpis: SocialBrandStats['kpis'] = [
    { label: 'Social score', value: score, delta: (deps.wqaState as any)?.socialScoreDelta },
    { label: 'Mentions (7d)', value: mentionsSummary.volume7d ?? '—' },
    { label: 'Social traffic', value: ga4Sum.last30dSocialSessions ?? '—' },
  ]

  const networkWaffle = (ga4Sum.topSocialNetworks ?? []).map((t, i) => ({
    label: t.network,
    value: t.sessions,
    color: ['#1da1f2', '#1877f2', '#e1306c', '#0077b5'][i] || '#cbd5e1'
  }))

  const mentionKpis = [
    { label: 'Volume', value: mentionsSummary.volume7d ?? 0, spark: [20, 25, 18, 30, 22, 28] },
    { label: 'Top source', value: mentionsSummary.topSources?.[0]?.domain ?? '—' },
  ]

  const sentimentMix = [
    { label: 'Positive', value: 45 },
    { label: 'Neutral',  value: 40 },
    { label: 'Negative', value: 15 },
  ]

  const engagementKpis = [
    { label: 'Followers', value: accounts.reduce((s, a) => s + (a.followers ?? 0), 0).toLocaleString() },
    { label: 'Posts (7d)', value: last7dPosts ?? 0 },
    { label: 'Eng. rate',  value: avgEng ? `${avgEng.toFixed(2)}%` : '—' },
  ]

  const followerTable = accounts.map(a => ({ network: a.network, followers: a.followers ?? 0 }))

  const trafficKpis = [
    { label: 'Sessions (30d)', value: ga4Sum.last30dSocialSessions ?? 0 },
    { label: 'Top network',     value: ga4Sum.topSocialNetworks?.[0]?.network ?? '—' },
  ]

  const trafficBySource = (ga4Sum.topSocialNetworks ?? []).map(t => ({ label: t.network, count: t.sessions }))

  return {
    overall: {
      score,
      chips: [
        { label: 'OG title',       value: `${ogCovPct}%`,    tone: ogCovPct >= 90 ? 'good' : 'warn' },
        { label: 'OG image',       value: `${ogImgCovPct}%`, tone: ogImgCovPct >= 80 ? 'good' : 'warn' },
        { label: 'Twitter card',   value: `${twCovPct}%`,    tone: twCovPct >= 80 ? 'good' : 'warn' },
        { label: 'Share links',    value: `${sharer}`,        tone: sharer > 0 ? 'good' : 'warn' },
      ],
    },
    meta: {
      pagesWithOgTitle: ogTitle,
      pagesWithOgImage: ogImage,
      pagesWithTwitterCard: twCard,
      ogTitleCoveragePct: ogCovPct,
      ogImageCoveragePct: ogImgCovPct,
      twitterCardCoveragePct: twCovPct,
      sharerLinksDetected: sharer,
    },
    mentions: {
      source: mentionsSource,
      volume7d: mentionsSummary.volume7d ?? null,
      topSources: mentionsSummary.topSources ?? [],
      fetchedAt: mentionsConn?.lastFetchedAt as number | undefined,
    },
    engagement: {
      accounts,
      last7dPosts,
      avgEngagementRate: avgEng,
    },
    traffic: {
      ga4Source: !!ga4,
      last30dSocialSessions: ga4Sum.last30dSocialSessions ?? null,
      topNetworks: ga4Sum.topSocialNetworks ?? [],
      fetchedAt: ga4?.lastFetchedAt as number | undefined,
    },
    actions: topN(actions, 12, a => a.impact),

    // NEW FIELDS
    kpis,
    networkWaffle,
    mentionKpis,
    sentimentMix,
    engagementKpis,
    followerTable,
    trafficKpis,
    trafficBySource,
    overview: {
      followersTotal: accounts.reduce((s, a) => s + (a.followers ?? 0), 0),
      mentions30d: (mentionsSummary.volume7d ?? 0) * 4,
      sentiment: 0.75,
      engagementRatePct: avgEng,
      socialTraffic: {
        sessions: ga4Sum.last30dSocialSessions ?? 0,
        sitePctOfTotal: 5.2,
      },
      sovPct: 12.5,
      alerts: [],
    },
  }
}

export const socialBundle: RsModeBundle<SocialBrandStats> = {
  mode: 'socialBrand',
  accent: 'indigo',
  defaultTabId: 'social_overview',
  tabs: [
    { id: 'social_overview',    label: 'Overview',    Component: SocialOverviewTab },
    { id: 'social_mentions',    label: 'Mentions',    Component: SocialMentionsTab },
    { id: 'social_engagement',  label: 'Engagement',  Component: SocialEngagementTab },
    { id: 'social_traffic',     label: 'Traffic',     Component: SocialTrafficTab },
    { id: 'social_actions',     label: 'Actions',     Component: SocialActionsTab },
  ],
  computeStats: computeSocialBrandStats,
}
