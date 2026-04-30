import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { SocialOverviewTab, SocialMentionsTab, SocialEngagementTab, SocialTrafficTab, SocialActionsTab } from '../../components/seo-crawler/right-sidebar/modes/socialBrand'

export interface SocialBrandStats {
  source: 'connected' | 'partial' | 'none'
  overview: { followersTotal: number; mentions7d: number; sentimentScore: number | null; shareOfVoice: number | null; topNetwork: string | null; trend7d: ReadonlyArray<number> }
  mentions: { positive: number; neutral: number; negative: number; topInfluencers: ReadonlyArray<{ name: string; reach: number }>; topUrls: ReadonlyArray<{ url: string; mentions: number }> }
  engagement: { engagementRate: number | null; bestTimeBuckets: ReadonlyArray<ReadonlyArray<number>>; topPosts: ReadonlyArray<{ network: string; title: string; reach: number; engagementRate: number }> }
  traffic: { socialSessions: number | null; deltaPct: number | null; perNetwork: ReadonlyArray<{ network: string; sessions: number }>; assistedConversions: number | null }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeSocialBrandStats(deps: RsDataDeps): SocialBrandStats {
  const conn = deps.integrationConnections ?? {}
  const social = conn.socialListening, hoot = conn.hootsuite, ga4 = conn.ga4
  const summary = ((social ?? hoot)?.summary ?? {}) as any
  const ga = (ga4?.summary ?? {}) as any
  const source: SocialBrandStats['source'] = (social || hoot) && ga4 ? 'connected' : (social || hoot || ga4) ? 'partial' : 'none'

  const actions: RsAction[] = []
  if ((summary.negativePct ?? 0) > 0.2) actions.push({ id: 'neg',  label: `Address negative sentiment spike (${Math.round((summary.negativePct ?? 0) * 100)}%)`, severity: 'highLeverage', effort: 'med', impact: 65 })
  if ((summary.responseTimeHrs ?? 0) > 24) actions.push({ id: 'resp', label: 'Reduce response time below 24h', severity: 'strategic', effort: 'med', impact: 40 })
  if ((ga.socialSessionsDeltaPct ?? 0) < -0.1) actions.push({ id: 'traf', label: 'Recover social traffic decline', severity: 'highLeverage', effort: 'med', impact: 60 })

  return {
    source,
    overview: {
      followersTotal:  summary.followersTotal ?? 0,
      mentions7d:      summary.mentions7d     ?? 0,
      sentimentScore:  summary.sentimentScore ?? null,
      shareOfVoice:    summary.shareOfVoice   ?? null,
      topNetwork:      summary.topNetwork     ?? null,
      trend7d:         summary.mentionsTrend7d ?? [],
    },
    mentions: {
      positive: summary.sentiment?.positive ?? 0,
      neutral:  summary.sentiment?.neutral  ?? 0,
      negative: summary.sentiment?.negative ?? 0,
      topInfluencers: summary.topInfluencers ?? [],
      topUrls:        summary.topMentionUrls ?? [],
    },
    engagement: {
      engagementRate: summary.engagementRate ?? null,
      bestTimeBuckets: summary.bestTimeBuckets ?? [],
      topPosts: summary.topPosts ?? [],
    },
    traffic: {
      socialSessions:      ga.socialSessions      ?? null,
      deltaPct:            ga.socialSessionsDeltaPct ?? null,
      perNetwork:          ga.socialPerNetwork    ?? [],
      assistedConversions: ga.socialAssistedConversions ?? null,
    },
    actions,
    fetchedAt: (social ?? hoot ?? ga4)?.lastFetchedAt,
  }
}

export const socialBrandBundle: RsModeBundle<SocialBrandStats> = {
  mode: 'socialBrand', accent: 'indigo', defaultTabId: 'social_overview',
  tabs: [
    { id: 'social_overview',   label: 'Overview',   Component: SocialOverviewTab },
    { id: 'social_mentions',   label: 'Mentions',   Component: SocialMentionsTab },
    { id: 'social_engagement', label: 'Engagement', Component: SocialEngagementTab },
    { id: 'social_traffic',    label: 'Traffic',    Component: SocialTrafficTab },
    { id: 'social_actions',    label: 'Actions',    Component: SocialActionsTab },
  ],
  computeStats: computeSocialBrandStats,
}
