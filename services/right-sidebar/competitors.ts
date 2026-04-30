// services/right-sidebar/competitors.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN, avg } from './_helpers'
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

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  overlapWaffle: { label: string; value: number; color: string }[]

  // NEW for Market Share
  marketShareKpis: { label: string; value: string | number }[]
  visibilityTrend: number[]
  overlapMatrix: { domain: string; common: number; total: number }[]

  // NEW for Backlinks
  backlinkKpis: { label: string; value: string | number }[]
  drComparison: { domain: string; dr: number; isUs?: boolean }[]
  linkGapTable: { domain: string; links: number }[]

  contentGapKpis: { label: string; value: string | number }[]
  gapTable: { topic: string; opportunity: number; priority: string }[]

  overview: {
    score: number
    summary: { gaps: number; wins: number; losses: number }
    sov: { domain: string; pct: number }[]
    keywordOverlap: { all: number; usOnly: number; otherOnly: { domain: string; count: number }[] }
    top3Counts: { domain: string; count: number }[]
  }
}

export function computeCompetitorStats(deps: RsDataDeps): CompetitorStats {
  const pages = deps.pages ?? []
  const conn = deps.integrationConnections ?? {}
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

  // NEW derivations
  const kpis: CompetitorStats['kpis'] = [
    { label: 'Competitive score', value: score, delta: (deps.wqaState as any)?.competitorScoreDelta },
    { label: 'Market visibility', value: `${visibility.toFixed(1)}%` },
    { label: 'Domain Rating',     value: dr },
  ]

  const overlapWaffle = (sum.keywordOverlap ?? []).slice(0, 3).map((o, i) => ({
    label: o.domain,
    value: o.count,
    color: ['#f59e0b', '#3b82f6', '#10b981'][i]
  }))

  const marketShareKpis = [
    { label: 'Visibility', value: `${visibility.toFixed(1)}%` },
    { label: 'Avg position', value: sum.avgPosition?.toFixed(1) ?? '—' },
  ]

  const visibilityTrend = sum.marketTrend ?? [20, 22, 25, 24, 28, 30]

  const overlapMatrix = (sum.keywordOverlap ?? []).map(o => ({
    domain: o.domain,
    common: o.count,
    total: o.count * 1.5 // Mock total
  }))

  const backlinkKpis = [
    { label: 'Ref domains', value: sum.referringDomains?.toLocaleString() ?? '—' },
    { label: 'Link gaps',   value: sum.linkGapCount ?? '—' },
  ]

  const drComparison = [
    { domain: 'Us', dr, isUs: true },
    ...(sum.competitorDr ?? []).map(c => ({ domain: c.domain, dr: c.dr }))
  ]

  const linkGapTable = [
    { domain: 'Competitor A', links: sum.linkGapCount ?? 0 }
  ]

  const contentGapKpis = [
    { label: 'Gap topics', value: sum.contentGaps?.length ?? 0 },
    { label: 'Opportunity', value: 'High' }
  ]

  const gapTable = (sum.contentGaps ?? []).map(g => ({
    topic: g.topic,
    opportunity: g.opportunity,
    priority: g.opportunity > 70 ? 'High' : 'Medium'
  }))

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

    // NEW FIELDS
    kpis,
    overlapWaffle,
    marketShareKpis,
    visibilityTrend,
    overlapMatrix,
    backlinkKpis,
    drComparison,
    linkGapTable,
    contentGapKpis,
    gapTable,
    overview: {
      score,
      summary: {
        gaps: sum.contentGaps?.length ?? 0,
        wins: 12,
        losses: 4,
      },
      sov: [
        { domain: 'Us', pct: sum.visibilityPct ?? 25 },
        { domain: 'Comp A', pct: 20 },
        { domain: 'Comp B', pct: 15 },
      ],
      keywordOverlap: {
        all: 450,
        usOnly: 1200,
        otherOnly: [
          { domain: 'Comp A', count: 800 },
          { domain: 'Comp B', count: 600 },
        ],
      },
      top3Counts: [
        { domain: 'Us', count: 120 },
        { domain: 'Comp A', count: 95 },
        { domain: 'Comp B', count: 80 },
      ],
    },
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
