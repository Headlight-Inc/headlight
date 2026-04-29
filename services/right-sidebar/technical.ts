// services/right-sidebar/technical.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, isIndexable, pct, percentile } from './_helpers'
import {
  TechOverviewTab, TechIndexingTab, TechPerformanceTab, TechSecurityTab, TechCrawlabilityTab,
} from '../../components/seo-crawler/right-sidebar/modes/technical'

export interface TechnicalStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  indexing: {
    indexable: number
    noindex: number
    canonicalConflicts: number
    sitemapPresent: number          // pages found in sitemap
    sitemapTotal: number
    sitemapCoveragePct: number
    robotsParsedAt?: number
    robotsDisallows: number
  }
  performance: {
    p50LcpMs: number; p75LcpMs: number; p95LcpMs: number
    p50InpMs: number | null; p75InpMs: number | null
    p50ClsScore: number | null; p75ClsScore: number | null
    p50TtfbMs: number | null; p75TtfbMs: number | null
    slowPages: number; heavyPages: number
  }
  security: {
    httpsPct: number
    mixedContentPages: number
    hstsPages: number
    cspPages: number
    cookiesWithoutSecure: number
  }
  crawl: {
    orphans: number
    redirects: { total: number; chains: number; loops: number }
    brokenLinks: number
    depthHistogram: number[]   // index = depth 0..6+
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
}

export function computeTechnicalStats(deps: RsDataDeps): TechnicalStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  // Indexing
  const indexable = countWhere(pages, isIndexable)
  const noindex   = countWhere(pages, p => p.metaRobots?.includes('noindex'))
  const canonicalConflicts = countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url)
  const sitemapPresent = countWhere(pages, p => p.inSitemap === true)
  const sitemapCoveragePct = pct(sitemapPresent, n)
  const robotsParsedAt = conn.robots?.lastFetchedAt as number | undefined
  const robotsDisallows = (conn.robots?.summary as { disallows?: number } | undefined)?.disallows ?? 0

  // Performance — prefer integration data (PSI/CrUX) per-page if available, else use crawler load times
  const lcps = pages.map(p => p.lcpMs ?? 0).filter(x => x > 0)
  const inps = pages.map(p => p.inpMs ?? 0).filter(x => x > 0)
  const cls  = pages.map(p => p.cls ?? 0).filter(x => x > 0)
  const ttfb = pages.map(p => p.ttfbMs ?? p.loadTime ?? 0).filter(x => x > 0)
  const slow  = countWhere(pages, p => (p.loadTime ?? 0) > 2500)
  const heavy = countWhere(pages, p => (p.transferredBytes ?? 0) > 2 * 1024 * 1024)

  // Security
  const https = countWhere(pages, p => (p.url || '').startsWith('https://'))
  const mixed = countWhere(pages, p => !!p.hasMixedContent)
  const hsts  = countWhere(pages, p => !!p.hasHsts)
  const csp   = countWhere(pages, p => !!p.hasCsp)
  const insecureCookies = countWhere(pages, p => (p.insecureCookieCount ?? 0) > 0)

  // Crawlability
  const orphans = countWhere(pages, p => (p.inlinks ?? 0) === 0)
  const redirectsTotal = countWhere(pages, p => (p.status ?? 0) >= 300 && (p.status ?? 0) < 400)
  const redirectChains = countWhere(pages, p => (p.redirectChainLength ?? 0) > 1)
  const redirectLoops  = countWhere(pages, p => !!p.isRedirectLoop)
  const brokenLinks    = pages.reduce((s, p) => s + (p.brokenLinkCount ?? 0), 0)
  const depthHist: number[] = Array.from({ length: 7 }, () => 0)
  for (const p of pages) {
    const d = Math.min(6, Math.max(0, p.depth ?? 0))
    depthHist[d]++
  }

  // Score (weighted)
  const score = Math.round(
    0.30 * pct(indexable, n) +
    0.25 * pct(https, n) +
    0.20 * (slow === 0 ? 100 : Math.max(0, 100 - (slow / Math.max(1, n)) * 100)) +
    0.15 * (orphans === 0 ? 100 : Math.max(0, 100 - (orphans / Math.max(1, n)) * 100)) +
    0.10 * (brokenLinks === 0 ? 100 : Math.max(0, 100 - brokenLinks))
  )

  const actions: TechnicalStats['actions'] = [
    { id: 'fix-noindex',   label: `Review ${noindex} noindexed pages`,         effort: 'low',    impact: noindex },
    { id: 'fix-canonical', label: `Resolve ${canonicalConflicts} canonical conflicts`, effort: 'medium', impact: canonicalConflicts },
    { id: 'speed-up-slow', label: `Speed up ${slow} slow pages (>2.5s)`,        effort: 'high',   impact: slow },
    { id: 'shrink-heavy',  label: `Shrink ${heavy} heavy pages (>2 MB)`,        effort: 'medium', impact: heavy },
    { id: 'fix-orphans',   label: `Internal-link ${orphans} orphan pages`,      effort: 'medium', impact: orphans },
    { id: 'fix-broken',    label: `Fix ${brokenLinks} broken links`,            effort: 'high',   impact: brokenLinks },
    { id: 'fix-mixed',     label: `Resolve mixed content on ${mixed} pages`,    effort: 'medium', impact: mixed },
  ].filter(a => a.impact > 0).sort((a, b) => b.impact - a.impact)

  return {
    overall: {
      score,
      chips: [
        { label: 'Indexable', value: `${pct(indexable, n)}%`, tone: pct(indexable, n) >= 80 ? 'good' : 'warn' },
        { label: 'HTTPS',     value: `${pct(https, n)}%`,    tone: pct(https, n) >= 95 ? 'good' : 'bad' },
        { label: 'Slow',      value: `${slow}`,              tone: slow === 0 ? 'good' : 'warn' },
        { label: 'Broken',    value: `${brokenLinks}`,       tone: brokenLinks === 0 ? 'good' : 'bad' },
      ],
    },
    indexing: {
      indexable, noindex, canonicalConflicts,
      sitemapPresent, sitemapTotal: n, sitemapCoveragePct,
      robotsParsedAt, robotsDisallows,
    },
    performance: {
      p50LcpMs: percentile(lcps, 50), p75LcpMs: percentile(lcps, 75), p95LcpMs: percentile(lcps, 95),
      p50InpMs: inps.length ? percentile(inps, 50) : null,
      p75InpMs: inps.length ? percentile(inps, 75) : null,
      p50ClsScore: cls.length ? percentile(cls, 50) : null,
      p75ClsScore: cls.length ? percentile(cls, 75) : null,
      p50TtfbMs: ttfb.length ? percentile(ttfb, 50) : null,
      p75TtfbMs: ttfb.length ? percentile(ttfb, 75) : null,
      slowPages: slow, heavyPages: heavy,
    },
    security: {
      httpsPct: pct(https, n),
      mixedContentPages: mixed,
      hstsPages: hsts,
      cspPages: csp,
      cookiesWithoutSecure: insecureCookies,
    },
    crawl: {
      orphans,
      redirects: { total: redirectsTotal, chains: redirectChains, loops: redirectLoops },
      brokenLinks,
      depthHistogram: depthHist,
    },
    actions: actions.slice(0, 12),
  }
}

export const technicalBundle: RsModeBundle<TechnicalStats> = {
  mode: 'technical',
  accent: 'blue',
  defaultTabId: 'tech_overview',
  tabs: [
    { id: 'tech_overview',     label: 'Overview',     Component: TechOverviewTab },
    { id: 'tech_indexing',     label: 'Indexing',     Component: TechIndexingTab },
    { id: 'tech_performance',  label: 'Speed',        Component: TechPerformanceTab },
    { id: 'tech_security',     label: 'Security',     Component: TechSecurityTab },
    { id: 'tech_crawl',        label: 'Crawlability', Component: TechCrawlabilityTab },
  ],
  computeStats: computeTechnicalStats,
}
