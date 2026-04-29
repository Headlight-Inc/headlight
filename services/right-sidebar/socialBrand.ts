// services/right-sidebar/socialBrand.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
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
}

export function computeSocialBrandStats(deps: RsDataDeps): SocialBrandStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  const ogTitle = countWhere(pages, p => !!p.ogTitle)
  const ogImage = countWhere(pages, p => !!p.ogImage)
  const twCard  = countWhere(pages, p => !!p.twitterCard)
  const sharer  = countWhere(pages, p => /(twitter\.com\/share|facebook\.com\/sharer|linkedin\.com\/share)/.test((p.outboundLinkRefs ?? []).join(' ')))

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
