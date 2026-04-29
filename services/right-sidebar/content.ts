// services/right-sidebar/content.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, hasTitle, hasMetaDescription, hasH1, isThin, pct, dedupCount, avg, topN } from './_helpers'
import {
  ContentOverviewTab, ContentTopicsTab, ContentQualityTab, ContentAuthorsTab, ContentActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/content'

export interface ContentStats {
  overall: {
    score: number
    chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[]
  }
  topics: { topic: string; count: number }[]      // top 10 by occurrence in titles/H1
  keywords: { term: string; count: number }[]      // top 10 unigram/bigram from content
  intentMix: { kind: 'informational'|'commercial'|'transactional'|'navigational'|'unknown'; count: number }[]
  quality: {
    titleCoveragePct: number
    descCoveragePct: number
    h1CoveragePct: number
    thinPct: number
    avgWords: number
    medianReadabilityScore: number | null   // Flesch-Kincaid-style if available
    dupTitles: number
    dupDescriptions: number
    avgFreshnessDays: number | null
    stalePages: number          // last modified > 365 days
  }
  authors: { author: string; count: number; lastPublishedAt: number | null }[]
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
}

function tokenize(s: string): string[] {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))
}
const STOP = new Set(['this','that','with','from','have','your','about','their','they','there','when','what','will','more','than','also','into','some','only','over','been','were','these','those'])

function classifyIntent(p: { url?: string; title?: string }): ContentStats['intentMix'][number]['kind'] {
  const t = `${p.url ?? ''} ${p.title ?? ''}`.toLowerCase()
  if (/(buy|price|pricing|cart|checkout|order|deal|coupon)/.test(t)) return 'transactional'
  if (/(best|top|review|vs|compare|alternative)/.test(t))            return 'commercial'
  if (/(how|guide|tutorial|what|why|tips)/.test(t))                  return 'informational'
  if (/(about|contact|home|index|login|signup)/.test(t))             return 'navigational'
  return 'unknown'
}

export function computeContentStats(deps: RsDataDeps): ContentStats {
  const pages = deps.pages
  const n = pages.length

  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const dupTitles = dedupCount(pages, p => p.title?.trim() || null)
  const dupDescs  = dedupCount(pages, p => p.metaDesc?.trim() || null)
  const wordSum   = pages.reduce((s, p) => s + (p.wordCount ?? 0), 0)
  const avgWords  = n ? Math.round(wordSum / n) : 0

  // Readability (optional field on page)
  const reads = pages.map(p => p.readabilityScore ?? null).filter((x): x is number => x != null)
  const medianReadabilityScore = reads.length
    ? reads.sort((a, b) => a - b)[Math.floor(reads.length / 2)]
    : null

  // Freshness
  const now = Date.now()
  const ages = pages.map(p => p.lastModifiedAt ? Math.max(0, (now - p.lastModifiedAt) / 86400000) : null)
    .filter((x): x is number => x != null)
  const avgFreshnessDays = ages.length ? Math.round(avg(ages)) : null
  const stalePages = ages.filter(d => d > 365).length

  // Topics from titles + h1
  const topicCounts = new Map<string, number>()
  for (const p of pages) {
    for (const w of tokenize(`${p.title ?? ''} ${p.h1 ?? ''}`)) {
      topicCounts.set(w, (topicCounts.get(w) ?? 0) + 1)
    }
  }
  const topics = topN(
    Array.from(topicCounts, ([topic, count]) => ({ topic, count })),
    10, x => x.count
  )

  // Keywords from full text (use first 200 words per page to stay cheap)
  const kwCounts = new Map<string, number>()
  for (const p of pages) {
    const txt = (p.bodyText ?? '').slice(0, 1500)
    for (const w of tokenize(txt)) kwCounts.set(w, (kwCounts.get(w) ?? 0) + 1)
  }
  const keywords = topN(
    Array.from(kwCounts, ([term, count]) => ({ term, count })),
    10, x => x.count
  )

  // Intent mix
  const intent: Record<ContentStats['intentMix'][number]['kind'], number> = {
    informational: 0, commercial: 0, transactional: 0, navigational: 0, unknown: 0,
  }
  for (const p of pages) intent[classifyIntent(p)]++
  const intentMix = (Object.keys(intent) as Array<keyof typeof intent>).map(k => ({ kind: k, count: intent[k] }))

  // Authors
  const authorMap = new Map<string, { count: number; last: number | null }>()
  for (const p of pages) {
    const a = (p.author || '').trim(); if (!a) continue
    const cur = authorMap.get(a) ?? { count: 0, last: null }
    cur.count++
    cur.last = Math.max(cur.last ?? 0, p.publishedAt ?? p.lastModifiedAt ?? 0) || cur.last
    authorMap.set(a, cur)
  }
  const authors = topN(
    Array.from(authorMap, ([author, v]) => ({ author, count: v.count, lastPublishedAt: v.last })),
    20, a => a.count
  )

  // Score
  const score = Math.round(
    0.25 * pct(withTitle, n) +
    0.20 * pct(withDesc, n) +
    0.20 * pct(withH1, n) +
    0.15 * (100 - pct(thin, n)) +
    0.10 * (avgWords >= 600 ? 100 : avgWords >= 300 ? 60 : 30) +
    0.10 * (dupTitles === 0 ? 100 : Math.max(0, 100 - dupTitles))
  )

  const actions: ContentStats['actions'] = [
    { id: 'add-titles',  label: `Add titles to ${n - withTitle} pages`,            effort: 'low',    impact: n - withTitle },
    { id: 'add-desc',    label: `Add descriptions to ${n - withDesc} pages`,        effort: 'low',    impact: n - withDesc },
    { id: 'add-h1',      label: `Add H1 to ${n - withH1} pages`,                   effort: 'low',    impact: n - withH1 },
    { id: 'expand-thin', label: `Expand ${thin} thin pages (<300 words)`,           effort: 'medium', impact: thin },
    { id: 'dedup-titles',label: `Resolve ${dupTitles} duplicate titles`,            effort: 'medium', impact: dupTitles },
    { id: 'dedup-desc',  label: `Resolve ${dupDescs} duplicate descriptions`,       effort: 'medium', impact: dupDescs },
    { id: 'refresh-stale', label: `Refresh ${stalePages} pages older than 1 year`, effort: 'medium', impact: stalePages },
  ].filter(a => a.impact > 0)

  return {
    overall: {
      score,
      chips: [
        { label: 'Titles',       value: `${pct(withTitle, n)}%`, tone: pct(withTitle, n) >= 95 ? 'good' : 'warn' },
        { label: 'Descriptions', value: `${pct(withDesc, n)}%`,  tone: pct(withDesc, n)  >= 90 ? 'good' : 'warn' },
        { label: 'H1',           value: `${pct(withH1, n)}%`,    tone: pct(withH1, n)    >= 95 ? 'good' : 'warn' },
        { label: 'Avg words',    value: `${avgWords}`,           tone: avgWords >= 600 ? 'good' : avgWords >= 300 ? 'warn' : 'bad' },
      ],
    },
    topics, keywords, intentMix,
    quality: {
      titleCoveragePct: pct(withTitle, n),
      descCoveragePct: pct(withDesc, n),
      h1CoveragePct: pct(withH1, n),
      thinPct: pct(thin, n),
      avgWords,
      medianReadabilityScore,
      dupTitles, dupDescriptions: dupDescs,
      avgFreshnessDays, stalePages,
    },
    authors,
    actions: topN(actions, 12, a => a.impact),
  }
}

export const contentBundle: RsModeBundle<ContentStats> = {
  mode: 'content',
  accent: 'amber',
  defaultTabId: 'content_overview',
  tabs: [
    { id: 'content_overview', label: 'Overview', Component: ContentOverviewTab },
    { id: 'content_topics',   label: 'Topics',   Component: ContentTopicsTab },
    { id: 'content_quality',  label: 'Quality',  Component: ContentQualityTab },
    { id: 'content_authors',  label: 'Authors',  Component: ContentAuthorsTab },
    { id: 'content_actions',  label: 'Actions',  Component: ContentActionsTab },
  ],
  computeStats: computeContentStats,
}
