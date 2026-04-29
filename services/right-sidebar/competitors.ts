// services/right-sidebar/competitors.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
import {
  CompOverviewTab, CompMarketShareTab, CompBacklinksTab, CompContentTab, CompActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/competitors'

export interface CompetitorStats {
  source: 'ahrefs' | 'semrush' | 'none'
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  marketShare: {
    visibilityPct: number | null
    avgPosition: number | null
    keywordOverlap: { domain: string; count: number }[]
    marketTrend: number[]
  }
  backlinks: {
    domainRating: number | null
    referringDomains: number | null
    competitorDr: { domain: string; dr: number }[]
    linkGapCount: number | null
  }
  content: {
    avgWordCount: number
    topCompetingPages: { url: string; score: number }[]
    contentGaps: { topic: string; opportunity: number }[]
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
  fetchedAt?: number
}

export function computeCompetitorStats(deps: RsDataDeps): CompetitorStats {
  const pages = deps.pages
  const conn = deps.integrationConnections
  const ah = conn.ahrefs
  const sm = conn.semrush
  const source: CompetitorStats['source'] = ah ? 'ahrefs' : sm ? 'semrush' : 'none'
  const sum = ((ah ?? sm)?.summary ?? {}) as {
    visibilityPct?: number; avgPosition?: number; keywordOverlap?: { domain: string; count: number }[]
    marketTrend?: number[]; domainRating?: number; referringDomains?: number
    competitorDr?: { domain: string; dr: number }[]; linkGapCount?: number
    topCompetingPages?: { url: string; score: number }[]; contentGaps?: { topic: string; opportunity: number }[]
  }

  const avgWords = pages.length ? Math.round(pages.reduce((s, p) => s + (p.wordCount ?? 0), 0) / pages.length) : 0
  const dr = sum.domainRating ?? 50
  const visibility = sum.visibilityPct ?? 30

  const score = Math.round(
    0.40 * visibility +
    0.30 * dr +
    0.30 * (sum.keywordOverlap?.length ? Math.min(100, sum.keywordOverlap.length * 10) : 50)
  )

  const actions: CompetitorStats['actions'] = [
    { id: 'link-gap',    label: `Close ${sum.linkGapCount ?? 0} link gaps`,          effort: 'high',   impact: sum.linkGapCount ?? 0 },
    { id: 'content-gap', label: `Target ${sum.contentGaps?.length ?? 0} content gaps`, effort: 'medium', impact: sum.contentGaps?.length ?? 0 },
    { id: 'dr-boost',    label: `Improve DR (currently ${dr})`,                       effort: 'high',   impact: 100 - dr },
  ].filter(a => a.impact > 0)

  return {
    source,
    overall: {
      score,
      chips: [
        { label: 'Visib.',    value: visibility != null ? `${visibility.toFixed(1)}%` : '—', tone: 'info' },
        { label: 'DR',        value: sum.domainRating?.toString() ?? '—',                  tone: 'info' },
        { label: 'Ref.Dom',   value: sum.referringDomains?.toLocaleString() ?? '—',        tone: 'info' },
        { label: 'Pos.Avg',   value: sum.avgPosition?.toFixed(1) ?? '—',                    tone: 'info' },
      ],
    },
    marketShare: {
      visibilityPct: sum.visibilityPct ?? null,
      avgPosition: sum.avgPosition ?? null,
      keywordOverlap: sum.keywordOverlap ?? [],
      marketTrend: sum.marketTrend ?? [],
    },
    backlinks: {
      domainRating: sum.domainRating ?? null,
      referringDomains: sum.referringDomains ?? null,
      competitorDr: sum.competitorDr ?? [],
      linkGapCount: sum.linkGapCount ?? null,
    },
    content: {
      avgWordCount: avgWords,
      topCompetingPages: sum.topCompetingPages ?? [],
      contentGaps: sum.contentGaps ?? [],
    },
    actions: topN(actions, 12, a => a.impact),
    fetchedAt: (ah ?? sm)?.lastFetchedAt as number | undefined,
  }
}

export const competitorsBundle: RsModeBundle<CompetitorStats> = {
  mode: 'competitors',
  accent: 'orange',
  defaultTabId: 'comp_overview',
  tabs: [
    { id: 'comp_overview',     label: 'Overview',     Component: CompOverviewTab },
    { id: 'comp_marketshare',  label: 'Market Share', Component: CompMarketShareTab },
    { id: 'comp_backlinks',    label: 'Backlinks',    Component: CompBacklinksTab },
    { id: 'comp_content',      label: 'Content',      Component: CompContentTab },
    { id: 'comp_actions',      label: 'Actions',      Component: CompActionsTab },
  ],
  computeStats: computeCompetitorStats,
}
