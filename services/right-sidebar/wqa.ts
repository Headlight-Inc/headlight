import React from 'react'
import type { RsDataDeps, RsModeBundle, OverallScore, RsAction } from './types'
import { countWhere, dedupCount, percentile, avg, pct, isThin, isIndexable, hasTitle, hasMetaDescription, hasH1 } from './utils'
import { WqaOverviewTab } from '../../components/seo-crawler/right-sidebar/modes/wqa/OverviewTab'
import { WqaActionsTab } from '../../components/seo-crawler/right-sidebar/modes/wqa/ActionsTab'
import { WqaSearchTab } from '../../components/seo-crawler/right-sidebar/modes/wqa/SearchTab'
import { WqaContentTab } from '../../components/seo-crawler/right-sidebar/modes/wqa/ContentTab'
import { WqaTechTab } from '../../components/seo-crawler/right-sidebar/modes/wqa/TechTab'

export interface WqaStats {
  qScore: number
  qScoreDeltaPct?: number
  qScoreSpark?: number[]
  pages: number
  issuesTotal: number
  issuesDeltaPct?: number
  qualityHistogram: ReadonlyArray<{ label: string; count: number }>
  needsDecision: { rewrite: number; merge: number; expand: number; deprecate: number }
  actions: ReadonlyArray<RsAction>
  actionsByPriority: { high: number; medium: number; low: number }
  topActionTemplates: ReadonlyArray<{ id: string; label: string; pagesAffected: number }>
  ownerLoad: ReadonlyArray<{ owner: string; count: number }>
  impactForecast?: { traffic: { label: string; unit: string; deltaValue: number; confidencePct: number }; conversions: { label: string; unit: string; deltaValue: number; confidencePct: number } }
  search: {
    indexable: number; nonIndexable: number
    sitemapMissing: number; sitemapTotal: number
    canonicalIssues: number
    clicks?: number; clicksDeltaPct?: number
    impr?: number
    pos28d?: number; pos28dDelta?: number
    keywordBuckets: ReadonlyArray<{ label: string; count: number }>
    movers: { winners: ReadonlyArray<{ label: string; delta: number }>; losers: ReadonlyArray<{ label: string; delta: number }> }
  }
  content: {
    withTitle: number; withDesc: number; withH1: number
    thin: number; avgWords: number
    dupTitles: number; dupDescriptions: number
    wordsHistogram: ReadonlyArray<{ label: string; count: number }>
    readabilityAvg: number | null
    freshnessHistogram: ReadonlyArray<{ label: string; count: number }>
  }
  tech: {
    statusMix: ReadonlyArray<{ label: string; count: number; tone?: 'good' | 'warn' | 'bad' }>
    indexableCount: number; noindexCount: number; blockedCount: number; canonMismatchCount: number
    cwv: { lcpP75: number | null; inpP75: number | null; clsP75: number | null }
    httpsPct: number
    heavyPages: number; slowPages: number
  }
  fetchedAt?: string
}

export function computeWqaStats(deps: RsDataDeps): WqaStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const indexable    = countWhere(pages, isIndexable)
  const nonIndexable = n - indexable
  const noindex      = countWhere(pages, p => String(p?.metaRobots1 ?? '').toLowerCase().includes('noindex'))
  const blocked      = countWhere(pages, p => p?.status === 'Blocked by Robots.txt')
  const canonMismatch= countWhere(pages, p => p?.canonical && p.canonical !== p.url)
  const sitemapPresent = countWhere(pages, p => p?.inSitemap === true)

  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const dupTitles = dedupCount(pages, p => p?.title?.trim().toLowerCase() || null)
  const dupDescs  = dedupCount(pages, p => p?.metaDesc?.trim().toLowerCase() || null)
  const avgWords  = Math.round(avg(pages.map(p => Number(p?.wordCount ?? 0))))

  const lcps = pages.map(p => Number(p?.lcp ?? 0)).filter(x => x > 0)
  const inps = pages.map(p => Number(p?.inp ?? 0)).filter(x => x > 0)
  const cls  = pages.map(p => Number(p?.cls ?? 0)).filter(x => x > 0)
  const slow  = countWhere(pages, p => Number(p?.loadTime ?? 0) > 2500)
  const heavy = countWhere(pages, p => Number(p?.transferredBytes ?? 0) > 2 * 1024 * 1024)
  const https = countWhere(pages, p => String(p?.url || '').startsWith('https://'))

  const issuesTotal =
    (n - indexable) + (n - withTitle) + (n - withDesc) + thin + dupTitles + dupDescs + slow + heavy
  const qScore = clamp(100 - 100 * (issuesTotal / Math.max(1, n * 4)))

  const qualityHistogram = Array.from({ length: 5 }, (_, i) => ({
    label: `${i * 20}-${(i + 1) * 20}`,
    count: countWhere(pages, p => {
      const v = Number(p?.contentQualityScore ?? 50)
      return v >= i * 20 && v < (i + 1) * 20
    }),
  }))

  const actions = buildWqaActions({ noindex, thin, blocked, canonMismatch, slow, dupTitles, dupDescs })
  const byPri = { high: 0, medium: 0, low: 0 }
  for (const a of actions) {
    if (a.severity === 'blocking' || a.severity === 'revenueLoss') byPri.high++
    else if (a.severity === 'highLeverage') byPri.medium++
    else byPri.low++
  }

  const search = (conn.gsc?.summary ?? {}) as any
  const wordsHistogram = bucketize(pages.map(p => Number(p?.wordCount ?? 0)), [0, 300, 600, 1200, 2500])

  return {
    qScore, qScoreDeltaPct: search.qScoreDeltaPct, qScoreSpark: search.qScoreSpark,
    pages: n, issuesTotal, issuesDeltaPct: search.issuesDeltaPct,
    qualityHistogram,
    needsDecision: {
      rewrite:   countWhere(pages, p => p?.recommendedAction === 'Rewrite Title & Description' || p?.recommendedAction === 'Improve Content'),
      merge:     countWhere(pages, p => p?.recommendedAction === 'Merge or Remove' && !!p?.nearDuplicateMatch),
      expand:    countWhere(pages, p => isThin(p) && Number(p?.opportunityScore ?? 0) >= 50),
      deprecate: countWhere(pages, p => p?.recommendedAction === 'Merge or Remove' && !p?.nearDuplicateMatch),
    },
    actions,
    actionsByPriority: byPri,
    topActionTemplates: groupBy(actions, a => a.label).slice(0, 6),
    ownerLoad: [],
    impactForecast: actions.length ? {
      traffic:     { label: 'Traffic',     unit: ' visits/d', deltaValue: actions.reduce((s, a) => s + a.impact, 0) * 2, confidencePct: 65 },
      conversions: { label: 'Conversions', unit: '/wk',       deltaValue: actions.reduce((s, a) => s + a.impact, 0),     confidencePct: 55 },
    } : undefined,
    search: {
      indexable, nonIndexable,
      sitemapMissing: Math.max(0, n - sitemapPresent), sitemapTotal: n,
      canonicalIssues: canonMismatch,
      clicks: search.clicks28d, clicksDeltaPct: search.clicksDeltaPct,
      impr: search.impressions28d,
      pos28d: search.avgPosition, pos28dDelta: search.avgPositionDelta,
      keywordBuckets: [
        { label: '1-3',   count: search.kwTop3   ?? 0 },
        { label: '4-10',  count: search.kwTop10  ?? 0 },
        { label: '11-20', count: search.kwTop20  ?? 0 },
        { label: '21-50', count: search.kwTop50  ?? 0 },
        { label: '50+',   count: search.kwBeyond ?? 0 },
      ],
      movers: { winners: search.winners ?? [], losers: search.losers ?? [] },
    },
    content: {
      withTitle, withDesc, withH1, thin, avgWords,
      dupTitles, dupDescriptions: dupDescs,
      wordsHistogram,
      readabilityAvg: pages.length ? Math.round(avg(pages.map(p => Number(p?.fleschScore ?? 0)).filter(x => x > 0))) : null,
      freshnessHistogram: bucketizeAge(pages),
    },
    tech: {
      statusMix: [
        { label: '2xx',     count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 200 && Number(p?.statusCode) < 300), tone: 'good' },
        { label: '3xx',     count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 300 && Number(p?.statusCode) < 400), tone: 'warn' },
        { label: '4xx',     count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 400 && Number(p?.statusCode) < 500), tone: 'bad'  },
        { label: '5xx',     count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 500), tone: 'bad' },
      ],
      indexableCount: indexable, noindexCount: noindex, blockedCount: blocked, canonMismatchCount: canonMismatch,
      cwv: {
        lcpP75: lcps.length ? Math.round(percentile(lcps, 75)) : null,
        inpP75: inps.length ? Math.round(percentile(inps, 75)) : null,
        clsP75: cls.length  ? Number(percentile(cls,  75).toFixed(2)) : null,
      },
      httpsPct: pct(https, n),
      heavyPages: heavy, slowPages: slow,
    },
    fetchedAt: conn.crawl?.completedAt,
  }
}

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, Math.round(n))) }
function bucketize(values: number[], edges: number[]) {
  return edges.slice(0, -1).map((e, i) => ({ label: `${edges[i]}-${edges[i + 1]}`, count: values.filter(v => v >= e && v < edges[i + 1]).length }))
}
function bucketizeAge(pages: ReadonlyArray<any>) {
  const days = pages.map(p => p?.lastModifiedAt ? (Date.now() - p.lastModifiedAt) / 86_400_000 : null).filter((v): v is number => v != null)
  return [
    { label: '0-30',    count: days.filter(d => d < 30).length },
    { label: '30-180',  count: days.filter(d => d >= 30 && d < 180).length },
    { label: '180-365', count: days.filter(d => d >= 180 && d < 365).length },
    { label: '1y+',     count: days.filter(d => d >= 365).length },
  ]
}
function groupBy<T>(arr: ReadonlyArray<T>, key: (x: T) => string): { id: string; label: string; pagesAffected: number }[] {
  const m = new Map<string, number>()
  for (const x of arr) m.set(key(x), (m.get(key(x)) ?? 0) + 1)
  return Array.from(m, ([label, pagesAffected]) => ({ id: label, label, pagesAffected })).sort((a, b) => b.pagesAffected - a.pagesAffected)
}
function buildWqaActions(s: { noindex: number; thin: number; blocked: number; canonMismatch: number; slow: number; dupTitles: number; dupDescs: number }): RsAction[] {
  const out: RsAction[] = []
  if (s.blocked)      out.push({ id: 'unblock',     label: `Unblock ${s.blocked} pages from robots.txt`,        severity: 'blocking',     effort: 'low',  impact: 90, pagesAffected: s.blocked })
  if (s.noindex)      out.push({ id: 'noindex',     label: `Review ${s.noindex} noindex pages`,                 severity: 'highLeverage', effort: 'low',  impact: 60, pagesAffected: s.noindex })
  if (s.canonMismatch)out.push({ id: 'canon',       label: `Fix ${s.canonMismatch} canonical mismatches`,        severity: 'revenueLoss',  effort: 'low',  impact: 70, pagesAffected: s.canonMismatch })
  if (s.thin)         out.push({ id: 'thin',        label: `Expand ${s.thin} thin pages`,                       severity: 'highLeverage', effort: 'med',  impact: 70, pagesAffected: s.thin })
  if (s.slow)         out.push({ id: 'slow',        label: `Speed up ${s.slow} slow pages (>2.5s TTFB)`,         severity: 'highLeverage', effort: 'med',  impact: 60, pagesAffected: s.slow })
  if (s.dupTitles)    out.push({ id: 'dup-titles',  label: `Rewrite ${s.dupTitles} duplicate titles`,             severity: 'highLeverage', effort: 'low',  impact: 50, pagesAffected: s.dupTitles })
  if (s.dupDescs)     out.push({ id: 'dup-descs',   label: `Rewrite ${s.dupDescs} duplicate descriptions`,        severity: 'strategic',    effort: 'low',  impact: 30, pagesAffected: s.dupDescs })
  return out
}

export const wqaBundle: RsModeBundle<WqaStats> = {
  mode: 'wqa', accent: 'violet', defaultTabId: 'wqa_overview',
  tabs: [
    { id: 'wqa_overview', label: 'Overview', Component: WqaOverviewTab },
    { id: 'wqa_actions',  label: 'Actions',  Component: WqaActionsTab  },
    { id: 'wqa_search',   label: 'Search',   Component: WqaSearchTab   },
    { id: 'wqa_content',  label: 'Content',  Component: WqaContentTab  },
    { id: 'wqa_tech',     label: 'Tech',     Component: WqaTechTab     },
  ],
  computeStats: computeWqaStats,
}
