import React from 'react'
import type { RsDataDeps, RsModeBundle, OverallScore, RsAction } from './types'
import { countWhere, dedupCount, percentile, avg, pct, isThin, isIndexable, hasTitle, hasMetaDescription, hasH1 } from './utils'
import { FullOverviewTab } from '../../components/seo-crawler/right-sidebar/modes/fullAudit/OverviewTab'
import { FullIssuesTab } from '../../components/seo-crawler/right-sidebar/modes/fullAudit/IssuesTab'
import { FullScoresTab } from '../../components/seo-crawler/right-sidebar/modes/fullAudit/ScoresTab'
import { FullCrawlHealthTab } from '../../components/seo-crawler/right-sidebar/modes/fullAudit/CrawlHealthTab'
import { FullIntegrationsTab } from '../../components/seo-crawler/right-sidebar/modes/fullAudit/IntegrationsTab'

export interface FullAuditStats {
  overall: OverallScore
  totals: { pages: number; indexable: number; broken: number; https: number; sitemap: number; thin: number }
  subscores: ReadonlyArray<{ key: 'tech' | 'content' | 'links' | 'ux' | 'ai' | 'commerce' | 'local' | 'social'; label: string; value: number }>
  scoreDistribution: ReadonlyArray<{ label: string; count: number }>
  scoreMovers: { up: number; down: number }
  cohortPercentile?: number
  topIssueGroups: ReadonlyArray<{ id: string; label: string; count: number; severity: 'blocking' | 'revenueLoss' | 'highLeverage' | 'strategic' | 'hygiene' }>
  responseP90Ms: number | null
  responseP99Ms: number | null
  duplicates: { titles: number; descriptions: number; h1s: number }
  sitemapCoveragePct: number
  integrations: ReadonlyArray<{ id: string; label: string; status: 'connected' | 'partial' | 'missing'; lastFetchedAt?: string }>
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeFullAuditStats(deps: RsDataDeps): FullAuditStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const indexable = countWhere(pages, isIndexable)
  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const https     = countWhere(pages, p => String(p?.url || '').startsWith('https://'))
  const broken    = countWhere(pages, p => Number(p?.statusCode ?? 0) >= 400)
  const inSitemap = countWhere(pages, p => p?.inSitemap === true)
  const respTimes = pages.map(p => Number(p?.loadTime ?? 0)).filter(x => x > 0)

  const techScore    = clamp(100 - 100 * (broken / n) - 30 * (1 - https / n))
  const contentScore = clamp(100 - 80 * (thin / n) - 20 * ((n - withTitle) / n) - 10 * ((n - withDesc) / n))
  const linksScore   = 60   // placeholder until link sub-bundle lands
  const uxScore      = 70
  const aiScore      = conn.llmsTxt ? 70 : 50
  const commerceScore= 50
  const localScore   = conn.googleBusiness ? 70 : 50
  const socialScore  = 60
  const subscores = [
    { key: 'tech',     label: 'Technical', value: techScore    },
    { key: 'content',  label: 'Content',   value: contentScore },
    { key: 'links',    label: 'Links',     value: linksScore   },
    { key: 'ux',       label: 'UX',        value: uxScore      },
    { key: 'ai',       label: 'AI',        value: aiScore      },
    { key: 'commerce', label: 'Commerce',  value: commerceScore},
    { key: 'local',    label: 'Local',     value: localScore   },
    { key: 'social',   label: 'Social',    value: socialScore  },
  ] as const
  const score = Math.round(avg(subscores.map(s => s.value)))

  const buckets = [0, 20, 40, 60, 80, 100]
  const dist = Array.from({ length: 5 }, (_, i) => ({
    label: `${buckets[i]}-${buckets[i + 1]}`,
    count: countWhere(pages, p => {
      const v = Number(p?.healthScore ?? p?.opportunityScore ?? 50)
      return v >= buckets[i] && v < buckets[i + 1]
    }),
  }))

  return {
    overall: {
      score,
      chips: [
        { label: 'Indexable',    value: pct(indexable, n) + '%', tone: indexable / n >= 0.9 ? 'good' : 'warn' },
        { label: 'HTTPS',        value: pct(https, n) + '%',     tone: https / n >= 0.99 ? 'good' : 'bad'   },
        { label: 'In sitemap',   value: pct(inSitemap, n) + '%' },
        { label: 'Broken',       value: broken,                  tone: broken === 0 ? 'good' : 'bad'   },
      ],
    },
    totals: { pages: pages.length, indexable, broken, https, sitemap: inSitemap, thin },
    subscores,
    scoreDistribution: dist,
    scoreMovers: { up: 0, down: 0 }, // wire to history when available
    cohortPercentile: conn.benchmarks?.percentile ?? undefined,
    topIssueGroups: [
      { id: 'broken',   label: 'Broken pages (4xx/5xx)', count: broken,             severity: 'blocking'    },
      { id: 'thin',     label: 'Thin content',           count: thin,               severity: 'highLeverage' },
      { id: 'noTitle',  label: 'Missing titles',         count: n - withTitle,      severity: 'revenueLoss' },
      { id: 'noDesc',   label: 'Missing descriptions',   count: n - withDesc,       severity: 'highLeverage' },
      { id: 'noH1',     label: 'Missing H1',             count: n - withH1,         severity: 'strategic'   },
      { id: 'http',     label: 'HTTP pages',             count: pages.length - https, severity: 'revenueLoss' },
    ].filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 8),
    responseP90Ms: respTimes.length ? Math.round(percentile(respTimes, 90)) : null,
    responseP99Ms: respTimes.length ? Math.round(percentile(respTimes, 99)) : null,
    duplicates: {
      titles:        dedupCount(pages, p => p?.title?.trim().toLowerCase() || null),
      descriptions:  dedupCount(pages, p => p?.metaDesc?.trim().toLowerCase() || null),
      h1s:           dedupCount(pages, p => p?.h1_1?.trim().toLowerCase() || null),
    },
    sitemapCoveragePct: pct(inSitemap, n),
    integrations: [
      { id: 'gsc',     label: 'Search Console', status: conn.gsc?.connected ? 'connected' : 'missing', lastFetchedAt: conn.gsc?.lastFetchedAt },
      { id: 'ga4',     label: 'GA4',            status: conn.ga4?.connected ? 'connected' : 'missing', lastFetchedAt: conn.ga4?.lastFetchedAt },
      { id: 'ahrefs',  label: 'Ahrefs',         status: conn.ahrefs ? 'connected' : 'missing' },
      { id: 'semrush', label: 'Semrush',        status: conn.semrush ? 'connected' : 'missing' },
      { id: 'gbp',     label: 'GBP',            status: conn.googleBusiness ? 'connected' : 'missing' },
      { id: 'ads',     label: 'Google Ads',     status: conn.googleAds ? 'connected' : 'missing' },
      { id: 'meta',    label: 'Meta Ads',       status: conn.metaAds ? 'connected' : 'missing' },
    ],
    actions: buildFullAuditActions({ broken, thin, noTitle: n - withTitle, noDesc: n - withDesc }),
    fetchedAt: conn.crawl?.completedAt,
  }
}

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, Math.round(n))) }
function buildFullAuditActions(s: { broken: number; thin: number; noTitle: number; noDesc: number }): RsAction[] {
  const out: RsAction[] = []
  if (s.broken)  out.push({ id: 'fix-broken',  label: `Fix ${s.broken} broken pages`,        severity: 'blocking',    effort: 'med', impact: 90, pagesAffected: s.broken })
  if (s.thin)    out.push({ id: 'expand-thin', label: `Expand ${s.thin} thin pages`,         severity: 'highLeverage', effort: 'med', impact: 70, pagesAffected: s.thin })
  if (s.noTitle) out.push({ id: 'add-titles',  label: `Add titles to ${s.noTitle} pages`,    severity: 'revenueLoss',  effort: 'low', impact: 70, pagesAffected: s.noTitle })
  if (s.noDesc)  out.push({ id: 'add-descs',   label: `Add descriptions to ${s.noDesc} pages`, severity: 'highLeverage', effort: 'low', impact: 50, pagesAffected: s.noDesc })
  return out
}

export const fullAuditBundle: RsModeBundle<FullAuditStats> = {
  mode: 'fullAudit',
  accent: 'slate',
  defaultTabId: 'full_overview',
  tabs: [
    { id: 'full_overview',     label: 'Overview',     Component: FullOverviewTab },
    { id: 'full_issues',       label: 'Issues',       Component: FullIssuesTab },
    { id: 'full_scores',       label: 'Scores',       Component: FullScoresTab },
    { id: 'full_crawl',        label: 'Crawl Health', Component: FullCrawlHealthTab },
    { id: 'full_integrations', label: 'Integrations', Component: FullIntegrationsTab },
  ],
  computeStats: computeFullAuditStats,
}
