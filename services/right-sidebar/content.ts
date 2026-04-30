import React from 'react'
import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { countWhere, dedupCount, avg, pct, isThin, hasTitle, hasMetaDescription, hasH1, topN } from './utils'
import { ContentOverviewTab, ContentTopicsTab, ContentQualityTab, ContentAuthorsTab, ContentActionsTab } from '../../components/seo-crawler/right-sidebar/modes/content'

export interface ContentStats {
  overview: { totalPages: number; thinPct: number; avgWords: number; staleDays: number | null; dupTitles: number; dupDescs: number; freshShare: number }
  topics: { topClusters: ReadonlyArray<{ name: string; count: number; share: number }>; intents: ReadonlyArray<{ label: string; count: number }>; orphanClusters: number }
  quality: { titleCoveragePct: number; descCoveragePct: number; h1CoveragePct: number; avgWords: number; thinPct: number; medianReadabilityScore: number | null; avgFreshnessDays: number | null; stalePages: number; dupTitles: number; dupDescriptions: number }
  authors: ReadonlyArray<{ name: string; pages: number; avgScore: number }>
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeContentStats(deps: RsDataDeps): ContentStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const dupTitles = dedupCount(pages, p => p?.title?.trim().toLowerCase() || null)
  const dupDescs  = dedupCount(pages, p => p?.metaDesc?.trim().toLowerCase() || null)
  const wordSum   = pages.reduce((s, p) => s + Number(p?.wordCount ?? 0), 0)
  const avgWords  = Math.round(wordSum / n)

  const reads = pages.map(p => Number(p?.fleschScore ?? p?.readabilityScore ?? 0)).filter(x => x > 0).sort((a, b) => a - b)
  const medianReadability = reads.length ? Math.round(reads[Math.floor(reads.length / 2)]) : null

  const ages = pages.map(p => p?.lastModifiedAt ? Math.max(0, (Date.now() - p.lastModifiedAt) / 86_400_000) : null).filter((x): x is number => x != null)
  const avgFresh = ages.length ? Math.round(avg(ages)) : null
  const stale = ages.filter(d => d > 365).length
  const fresh = ages.filter(d => d <= 30).length

  const clusterCounts = new Map<string, number>()
  for (const p of pages) { const k = p?.topicCluster; if (k) clusterCounts.set(k, (clusterCounts.get(k) ?? 0) + 1) }
  const topClusters = topN(Array.from(clusterCounts, ([name, count]) => ({ name, count })), 6).map(c => ({ ...c, share: pct(c.count, n) }))
  const orphanClusters = Array.from(clusterCounts.values()).filter(c => c === 1).length

  const intentMap = new Map<string, number>()
  for (const p of pages) { const i = p?.searchIntent; if (i) intentMap.set(i, (intentMap.get(i) ?? 0) + 1) }

  const authorMap = new Map<string, { pages: number; sumScore: number }>()
  for (const p of pages) {
    const a = p?.author; if (!a) continue
    const cur = authorMap.get(a) ?? { pages: 0, sumScore: 0 }
    cur.pages++; cur.sumScore += Number(p?.contentQualityScore ?? 50)
    authorMap.set(a, cur)
  }
  const authors = Array.from(authorMap, ([name, v]) => ({ name, pages: v.pages, avgScore: Math.round(v.sumScore / Math.max(1, v.pages)) }))
                  .sort((a, b) => b.pages - a.pages).slice(0, 8)

  const actions: RsAction[] = []
  if (thin)        actions.push({ id: 'expand-thin',  label: `Expand ${thin} thin pages`,         severity: 'highLeverage', effort: 'med', impact: 70, pagesAffected: thin })
  if (dupTitles)   actions.push({ id: 'dup-titles',   label: `Rewrite ${dupTitles} duplicate titles`,    severity: 'highLeverage', effort: 'low', impact: 50, pagesAffected: dupTitles })
  if (dupDescs)    actions.push({ id: 'dup-descs',    label: `Rewrite ${dupDescs} duplicate descriptions`, severity: 'strategic', effort: 'low', impact: 30, pagesAffected: dupDescs })
  if (stale)       actions.push({ id: 'refresh',      label: `Refresh ${stale} stale pages (>1y)`,    severity: 'highLeverage', effort: 'med', impact: 55, pagesAffected: stale })
  if (orphanClusters) actions.push({ id: 'cluster',  label: `Cluster ${orphanClusters} orphan topics`, severity: 'strategic',    effort: 'med', impact: 40, pagesAffected: orphanClusters })

  return {
    overview: { totalPages: n, thinPct: pct(thin, n), avgWords, staleDays: avgFresh, dupTitles, dupDescs, freshShare: pct(fresh, n) },
    topics:   { topClusters, intents: Array.from(intentMap, ([label, count]) => ({ label, count })), orphanClusters },
    quality:  { titleCoveragePct: pct(withTitle, n), descCoveragePct: pct(withDesc, n), h1CoveragePct: pct(withH1, n), avgWords, thinPct: pct(thin, n), medianReadabilityScore: medianReadability, avgFreshnessDays: avgFresh, stalePages: stale, dupTitles, dupDescriptions: dupDescs },
    authors,
    actions,
    fetchedAt: conn.crawl?.completedAt,
  }
}

export const contentBundle: RsModeBundle<ContentStats> = {
  mode: 'content', accent: 'amber', defaultTabId: 'content_overview',
  tabs: [
    { id: 'content_overview', label: 'Overview', Component: ContentOverviewTab },
    { id: 'content_topics',   label: 'Topics',   Component: ContentTopicsTab },
    { id: 'content_quality',  label: 'Quality',  Component: ContentQualityTab },
    { id: 'content_authors',  label: 'Authors',  Component: ContentAuthorsTab },
    { id: 'content_actions',  label: 'Actions',  Component: ContentActionsTab },
  ],
  computeStats: computeContentStats,
}
