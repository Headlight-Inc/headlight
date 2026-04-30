import React from 'react'
import type { RsDataDeps, RsModeBundle, OverallScore } from './types'
import { countWhere, percentile, isIndexable, pct } from './utils'
import { TechOverviewTab, TechIndexingTab, TechPerformanceTab, TechSecurityTab, TechCrawlabilityTab } from '../../components/seo-crawler/right-sidebar/modes/technical'

export interface TechnicalStats {
  overall: OverallScore & { score: number; statusMix: ReadonlyArray<{ label: string; count: number; tone?: 'good'|'warn'|'bad' }>; renderMix: { static: number; ssr: number; csr: number }; ttfb: { p75: number | null; p90: number | null }; topRisks: ReadonlyArray<{ label: string; count: number }> }
  indexing: { indexable: number; noindex: number; canonicalConflicts: number; sitemapPresent: number; sitemapTotal: number; sitemapCoveragePct: number; robotsParsedAt?: string | number; robotsDisallows: number }
  performance: { lcpP75: number | null; inpP75: number | null; clsP75: number | null; ttfbP75: number | null; slowPages: number; heavyPages: number; renderBlockingPages: number }
  security: { httpsPct: number; mixedContentPages: number; hsts: number; csp: number; sslWeak: number; exposedKeys: number }
  crawl: { crawlable: number; blocked: number; depth: ReadonlyArray<{ label: string; count: number }>; redirectChains: number }
  fetchedAt?: string
}

export function computeTechnicalStats(deps: RsDataDeps): TechnicalStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const indexable = countWhere(pages, isIndexable)
  const noindex   = countWhere(pages, p => String(p?.metaRobots1 ?? '').toLowerCase().includes('noindex'))
  const canonConflict = countWhere(pages, p => p?.canonical && p.canonical !== p.url)
  const sitemapPresent = countWhere(pages, p => p?.inSitemap === true)

  const lcps = pages.map(p => Number(p?.lcp ?? 0)).filter(x => x > 0)
  const inps = pages.map(p => Number(p?.inp ?? 0)).filter(x => x > 0)
  const cls  = pages.map(p => Number(p?.cls ?? 0)).filter(x => x > 0)
  const ttfb = pages.map(p => Number(p?.loadTime ?? 0)).filter(x => x > 0)
  const slow  = countWhere(pages, p => Number(p?.loadTime ?? 0) > 2500)
  const heavy = countWhere(pages, p => Number(p?.transferredBytes ?? 0) > 2 * 1024 * 1024)
  const blocking = countWhere(pages, p => Number(p?.renderBlockingCss ?? 0) + Number(p?.renderBlockingJs ?? 0) > 3)

  const https = countWhere(pages, p => String(p?.url || '').startsWith('https://'))
  const mixed = countWhere(pages, p => p?.mixedContent === true)
  const hsts  = countWhere(pages, p => p?.hasHsts === true)
  const csp   = countWhere(pages, p => p?.hasCsp === true)
  const weak  = countWhere(pages, p => p?.sslIsWeakProtocol === true)
  const keys  = countWhere(pages, p => Number(p?.exposedApiKeys ?? 0) > 0)

  const blocked = countWhere(pages, p => p?.status === 'Blocked by Robots.txt')
  const crawlable = n - blocked
  const depth = [
    { label: '0-1', count: countWhere(pages, p => Number(p?.crawlDepth ?? 0) <= 1) },
    { label: '2-3', count: countWhere(pages, p => Number(p?.crawlDepth ?? 0) >= 2 && Number(p?.crawlDepth) <= 3) },
    { label: '4-5', count: countWhere(pages, p => Number(p?.crawlDepth ?? 0) >= 4 && Number(p?.crawlDepth) <= 5) },
    { label: '6+',  count: countWhere(pages, p => Number(p?.crawlDepth ?? 0) >= 6) },
  ]
  const redirectChains = countWhere(pages, p => Number(p?.redirectChainLength ?? 0) > 1)

  const renderMix = {
    static: countWhere(pages, p => p?.renderType === 'static' || (!p?.requiresJavaScript && p?.contentType?.includes('html'))),
    ssr:    countWhere(pages, p => p?.renderType === 'ssr'),
    csr:    countWhere(pages, p => p?.requiresJavaScript === true),
  }

  const topRisks = [
    { label: 'Slow',         count: slow },
    { label: 'Heavy',        count: heavy },
    { label: 'Render-block', count: blocking },
    { label: 'Noindex',      count: noindex },
    { label: 'Canon mismat', count: canonConflict },
    { label: 'Mixed cont.',  count: mixed },
  ].filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 6)

  const score = clamp(
    100
    - 30 * (slow / n)
    - 20 * (canonConflict / n)
    - 25 * ((n - https) / n)
    - 15 * (mixed / n)
    - 10 * (blocking / n)
  )

  return {
    overall: {
      score,
      chips: [
        { label: 'Indexable %', value: `${pct(indexable, n)}%` },
        { label: 'HTTPS %',     value: `${pct(https, n)}%`, tone: https / n >= 0.99 ? 'good' : 'bad' },
      ],
      statusMix: [
        { label: '2xx', count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 200 && Number(p?.statusCode) < 300), tone: 'good' },
        { label: '3xx', count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 300 && Number(p?.statusCode) < 400), tone: 'warn' },
        { label: '4xx', count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 400 && Number(p?.statusCode) < 500), tone: 'bad'  },
        { label: '5xx', count: countWhere(pages, p => Number(p?.statusCode ?? 0) >= 500), tone: 'bad' },
      ],
      renderMix,
      ttfb: { p75: ttfb.length ? Math.round(percentile(ttfb, 75)) : null, p90: ttfb.length ? Math.round(percentile(ttfb, 90)) : null },
      topRisks,
    },
    indexing: {
      indexable, noindex, canonicalConflicts: canonConflict,
      sitemapPresent, sitemapTotal: n, sitemapCoveragePct: pct(sitemapPresent, n),
      robotsParsedAt: conn.robots?.lastFetchedAt, robotsDisallows: conn.robots?.summary?.disallows ?? 0,
    },
    performance: {
      lcpP75: lcps.length ? Math.round(percentile(lcps, 75)) : null,
      inpP75: inps.length ? Math.round(percentile(inps, 75)) : null,
      clsP75: cls.length  ? Number(percentile(cls,  75).toFixed(2)) : null,
      ttfbP75: ttfb.length ? Math.round(percentile(ttfb, 75)) : null,
      slowPages: slow, heavyPages: heavy, renderBlockingPages: blocking,
    },
    security: { httpsPct: pct(https, n), mixedContentPages: mixed, hsts, csp, sslWeak: weak, exposedKeys: keys },
    crawl: { crawlable, blocked, depth, redirectChains },
    fetchedAt: conn.crawl?.completedAt,
  }
}
function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, Math.round(n))) }

export const technicalBundle: RsModeBundle<TechnicalStats> = {
  mode: 'technical', accent: 'blue', defaultTabId: 'tech_overview',
  tabs: [
    { id: 'tech_overview',    label: 'Overview',     Component: TechOverviewTab },
    { id: 'tech_indexing',    label: 'Indexing',     Component: TechIndexingTab },
    { id: 'tech_performance', label: 'Speed',        Component: TechPerformanceTab },
    { id: 'tech_security',    label: 'Security',     Component: TechSecurityTab },
    { id: 'tech_crawl',       label: 'Crawlability', Component: TechCrawlabilityTab },
  ],
  computeStats: computeTechnicalStats,
}
