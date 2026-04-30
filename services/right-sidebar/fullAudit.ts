// services/right-sidebar/fullAudit.ts
import type { CrawledPage } from '../CrawlDatabase'
import type { RsModeBundle, RsDataDeps } from './types'
import type {
  FullAuditStats, IssueCategory, Severity, AdapterId,
} from './fullAudit.types'
import {
  countWhere, isIndexable, hasTitle, hasMetaDescription, hasH1, isThin,
  pct, score100, avg, histogram, dedupCount, sortDesc, percentile,
} from './_helpers'
import {
  FullOverviewTab, FullIssuesTab, FullScoresTab,
  FullCrawlHealthTab, FullIntegrationsTab,
} from '../../components/seo-crawler/right-sidebar/modes/fullAudit'

const STATUS_COLOR = {
  '2xx': '#34d399', '3xx': '#60a5fa', '4xx': '#fbbf24', '5xx': '#fb7185',
} as const

const CATEGORY_COLOR: Record<string, string> = {
  article: '#60a5fa', doc: '#34d399', product: '#fbbf24',
  category: '#a78bfa', landing: '#22d3ee', other: '#71717a',
}

function bucketStatus(s: number): '2xx' | '3xx' | '4xx' | '5xx' | null {
  if (s >= 200 && s < 300) return '2xx'
  if (s >= 300 && s < 400) return '3xx'
  if (s >= 400 && s < 500) return '4xx'
  if (s >= 500 && s < 600) return '5xx'
  return null
}

function pageCategory(p: CrawledPage): string {
  return ((p as any).pageCategory as string)
    || ((p as any).category as string)
    || ((p as any).templateType as string)
    || 'other'
}

function classifyIssue(id: string): { cat: IssueCategory; sev: Severity } {
  // Map check ids to (category, severity). Extend in CheckRegistry if needed.
  if (id.startsWith('tech.')   || id === 'broken' || id === 'http5xx')   return { cat: 'Tech',     sev: 'critical' }
  if (id.startsWith('schema.') || id === 'schema-missing')                return { cat: 'Schema',   sev: 'medium' }
  if (id.startsWith('a11y.'))                                             return { cat: 'A11y',     sev: 'medium' }
  if (id.startsWith('security.') || id === 'mixed-content' || id === 'csp-missing')
                                                                          return { cat: 'Security', sev: 'high' }
  if (id.startsWith('link.')   || id === 'broken-link' || id === 'orphan')return { cat: 'Links',    sev: 'medium' }
  return { cat: 'Content', sev: 'medium' }
}

export function computeFullAuditStats(deps: RsDataDeps): FullAuditStats {
  const pages = deps.pages ?? []
  const n = pages.length
  const conn = deps.integrationConnections ?? {}
  const wqa  = deps.wqaState ?? {}

  // ===================== shared primitives =====================
  const indexable  = countWhere(pages, isIndexable)
  const withTitle  = countWhere(pages, hasTitle)
  const withDesc   = countWhere(pages, hasMetaDescription)
  const withH1     = countWhere(pages, hasH1)
  const thin       = countWhere(pages, isThin)
  const https      = countWhere(pages, p => (p.url || '').startsWith('https://'))
  const broken     = countWhere(pages, p => (p.statusCode ?? p.status ?? 0) >= 400)
  const schemaOk   = countWhere(pages, p => (p.schemaTypes?.length ?? 0) > 0)
  const inSitemap  = countWhere(pages, p => p.inSitemap === true)
  const dupTitles  = dedupCount(pages, p => p.title?.trim() || null)
  const dupDescs   = dedupCount(pages, p => p.metaDesc?.trim() || null)

  const respTimes = pages.map(p => p.loadTime ?? 0).filter(x => x > 0)
  const avgResp   = respTimes.length ? Math.round(avg(respTimes)) : null
  const p90Resp   = respTimes.length ? Math.round(percentile(respTimes, 90)) : null
  const p99Resp   = respTimes.length ? Math.round(percentile(respTimes, 99)) : null

  const orphans   = countWhere(pages, p => (p.inlinks ?? 0) === 0)
  const redirects = countWhere(pages, p => {
    const s = p.statusCode ?? p.status ?? 0
    return s >= 300 && s < 400
  })
  const brokenLnk = pages.reduce((s, p) => s + (p.brokenLinkCount ?? 0), 0)

  // status mix
  const mix: Record<'2xx'|'3xx'|'4xx'|'5xx', number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
  for (const p of pages) {
    const code = bucketStatus(p.statusCode ?? p.status ?? 0)
    if (code) mix[code] += 1
  }
  const statusMix = (['2xx','3xx','4xx','5xx'] as const)
    .map(c => ({ code: c, count: mix[c], color: STATUS_COLOR[c] }))

  // depth histogram d0..d5+
  const depths = pages.map(p => Number(p.crawlDepth ?? 0)).filter(Number.isFinite)
  const depthHist = histogram(depths, [0, 1, 2, 3, 4, 5])
    .map((v, i) => ({ label: i === 5 ? '5+' : `d${i}`, value: v }))

  // category donut
  const catCounts = new Map<string, number>()
  for (const p of pages) {
    const c = pageCategory(p)
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1)
  }
  const categoryDonut = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value,
      color: CATEGORY_COLOR[label] ?? CATEGORY_COLOR.other,
    }))

  // ===================== ISSUES tab =====================
  // Aggregate per-check. Each page exposes `auditIssues: { id, severity? }[]`.
  const checkCounts = new Map<string, number>()
  for (const p of pages) {
    const list = ((p as any).auditIssues ?? []) as { id: string }[]
    for (const it of list) {
      checkCounts.set(it.id, (checkCounts.get(it.id) ?? 0) + 1)
    }
  }

  const sevCounts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  const catCountsIss: Record<IssueCategory, number> = {
    Content: 0, Tech: 0, Schema: 0, Links: 0, A11y: 0, Security: 0,
  }
  let totalIssues = 0
  const topRows: FullAuditStats['issues']['top'] = []
  for (const [id, count] of checkCounts) {
    const { cat, sev } = classifyIssue(id)
    sevCounts[sev] += count
    catCountsIss[cat] += count
    totalIssues += count
    topRows.push({ id, label: id.replace(/[._-]/g, ' '), count, severity: sev })
  }
  topRows.sort((a, b) => b.count - a.count)

  const trendAll      = (wqa as any).issuesTrendAll      ?? Array(6).fill(totalIssues)
  const trendCritical = (wqa as any).issuesTrendCritical ?? Array(6).fill(sevCounts.critical)

  // ===================== SCORES tab =====================
  const subContent  = score100([
    { weight: 1, value: pct(withTitle, n) },
    { weight: 1, value: pct(withDesc, n) },
    { weight: 1, value: pct(withH1, n) },
    { weight: 1, value: 100 - pct(thin, n) },
  ])
  const subTech     = score100([
    { weight: 2, value: pct(https, n) },
    { weight: 1, value: avgResp == null ? 50 : Math.max(0, 100 - avgResp / 30) },
    { weight: 2, value: pct(indexable, n) },
    { weight: 2, value: 100 - pct(broken, n) },
  ])
  const subSchema   = pct(schemaOk, n)
  const subLinks    = score100([
    { weight: 1, value: 100 - pct(orphans, n) },
    { weight: 1, value: 100 - pct(redirects, n) },
    { weight: 1, value: brokenLnk === 0 ? 100 : Math.max(0, 100 - brokenLnk) },
  ])
  const a11yPasses  = countWhere(pages, p => (((p as any).a11yScore ?? 0) as number) >= 90)
  const subA11y     = pct(a11yPasses, n)
  const securePass  = countWhere(pages, p =>
    (p.url || '').startsWith('https://') && (((p as any).hasMixedContent ?? false) === false)
  )
  const subSecurity = pct(securePass, n)

  const subscores: FullAuditStats['scores']['subscores'] = [
    { axis: 'Content',  value: subContent },
    { axis: 'Tech',     value: subTech },
    { axis: 'Schema',   value: subSchema },
    { axis: 'Links',    value: subLinks },
    { axis: 'A11y',     value: subA11y },
    { axis: 'Security', value: subSecurity },
  ]
  const overall = Math.round(
    subscores.reduce((s, r) => s + r.value, 0) / subscores.length,
  )

  // page-score distribution (uses page.qualityScore if present, else derives)
  const pageScores = pages
    .map(p => {
      const ps = Number((p as any).qualityScore ?? (p as any).overallScore ?? 0)
      if (ps > 0) return ps
      // fallback: blend boolean signals
      let s = 0, c = 0
      if (hasTitle(p))           { s += 100; c++ } else { c++ }
      if (hasH1(p))              { s += 100; c++ } else { c++ }
      if (hasMetaDescription(p)) { s += 100; c++ } else { c++ }
      if (!isThin(p))            { s += 100; c++ } else { c++ }
      return c ? Math.round(s / c) : 0
    })
    .filter(v => v > 0)

  const distBuckets = histogram(pageScores, [0, 20, 40, 60, 80, 100])
  const pageDistribution = ['0-20', '20-40', '40-60', '60-80', '80-100']
    .map((label, i) => ({ label, value: distBuckets[i] ?? 0 }))

  const cohort = (wqa as any).cohortPercentile != null
    ? {
        percentile: Number((wqa as any).cohortPercentile),
        label: [(deps.industry ?? 'general'), wqa.detectedLanguage ?? 'en', `${n}pgs`]
          .filter(Boolean).join(' · '),
      }
    : null

  const movers = (wqa as any).pageScoreMovers as { up?: number; down?: number } | undefined

  // ===================== CRAWL HEALTH tab =====================
  const lastFinishedAt = (wqa as any).lastCrawlAt ?? null
  const durationMs     = (wqa as any).lastCrawlDurationMs ?? null
  const pagesPerSec = (durationMs && n) ? Number((n / (durationMs / 1000)).toFixed(2)) : null
  const discovered = ((wqa as any).discoveredCount as number) ?? n

  const errors = {
    timeouts: countWhere(pages, p => ((p as any).errorType === 'timeout')),
    http5xx:  countWhere(pages, p => {
      const s = p.statusCode ?? p.status ?? 0
      return s >= 500 && s < 600
    }),
    parse:    countWhere(pages, p => ((p as any).errorType === 'parse')),
    dns:      countWhere(pages, p => ((p as any).errorType === 'dns')),
  }
  const errorTotal = errors.timeouts + errors.http5xx + errors.parse + errors.dns

  const blocked = {
    robots:  countWhere(pages, p => ((p as any).blockedBy === 'robots')),
    meta:    countWhere(pages, p => ((p as any).blockedBy === 'meta-robots')),
    http403: countWhere(pages, p => (p.statusCode ?? p.status ?? 0) === 403),
  }
  const blockedTotal = blocked.robots + blocked.meta + blocked.http403

  const sitemapTotal      = ((wqa as any).sitemapUrlCount as number) ?? inSitemap
  const inSitemapAndCrawl = countWhere(pages, p => p.inSitemap === true)
  const inCrawlOnly       = countWhere(pages, p => p.inSitemap === false)
  const inSitemapOnly     = Math.max(0, sitemapTotal - inSitemapAndCrawl)

  const renderModes = pages
    .map(p => ((p as any).renderMode as 'static'|'ssr'|'csr'|undefined))
    .filter(Boolean) as Array<'static'|'ssr'|'csr'>
  const sampled = renderModes.length
  const renderSample = sampled > 0 ? {
    sampled, total: n,
    staticPct: pct(renderModes.filter(m => m === 'static').length, sampled),
    ssrPct:    pct(renderModes.filter(m => m === 'ssr').length,    sampled),
    csrPct:    pct(renderModes.filter(m => m === 'csr').length,    sampled),
  } : null

  // ===================== INTEGRATIONS tab =====================
  const C = (k: string) => conn[k] ?? conn[`google.${k}`]
  const adapters: FullAuditStats['integrations']['adapters'] = [
    { id: 'gsc',              label: 'Search Console', connected: !!C('gsc')?.connected,        lastSyncAt: C('gsc')?.lastSyncAt ?? null },
    { id: 'bing',             label: 'Bing Webmaster', connected: !!C('bing')?.connected,       lastSyncAt: C('bing')?.lastSyncAt ?? null },
    { id: 'gbp',              label: 'GBP',            connected: !!C('gbp')?.connected,        lastSyncAt: C('gbp')?.lastSyncAt ?? null },
    { id: 'backlinks',        label: 'Backlinks',      connected: !!C('backlinks')?.connected,  lastSyncAt: C('backlinks')?.lastSyncAt ?? null },
    { id: 'keywords',         label: 'Keywords',       connected: !!C('keywords')?.connected,   lastSyncAt: C('keywords')?.lastSyncAt ?? null },
    { id: 'contentInventory', label: 'Content inventory', connected: !!C('contentInventory')?.connected, lastSyncAt: C('contentInventory')?.lastSyncAt ?? null, detail: 'CMS export / sitemap diff' },
    { id: 'aiRouter',         label: 'AI router',      connected: !!C('aiRouter')?.connected,   lastSyncAt: C('aiRouter')?.lastSyncAt ?? null, detail: 'Pulse provider' },
    { id: 'mcpClients',       label: 'MCP clients',    connected: ((C('mcp')?.clients?.length ?? 0) > 0), lastSyncAt: C('mcp')?.lastSyncAt ?? null, detail: `${C('mcp')?.clients?.length ?? 0} client(s)` },
  ]

  const freshness = [
    { id: 'gsc'       as AdapterId, label: 'GSC',       description: '28d rolling' },
    { id: 'bing'      as AdapterId, label: 'Bing',      description: '28d rolling' },
    { id: 'backlinks' as AdapterId, label: 'Backlinks', description: 'provider + upload' },
  ]

  const coverage = [
    { label: 'Pages w/ GSC',      value: pct(countWhere(pages, p => (p.gscClicks != null) || (p.gscImpressions != null)), n) },
    { label: 'Pages w/ keywords', value: pct(countWhere(pages, p => ((p as any).keywords?.length ?? 0) > 0), n) },
    { label: 'Pages w/ backlinks',value: pct(countWhere(pages, p => ((p as any).backlinkCount ?? 0) > 0), n) },
  ]

  const missing: { id: string; label: string }[] = []
  if (!adapters.find(a => a.id === 'contentInventory')?.connected) missing.push({ id: 'review',     label: 'Review source' })
  if (!conn['productFeed']?.connected)                              missing.push({ id: 'feed',       label: 'Product feed' })
  if (!conn['renderDiff']?.connected)                               missing.push({ id: 'renderDiff', label: 'Render-diff store' })

  // ===================== compose =====================
  return {
    overview: {
      score: overall,
      scoreDelta: (wqa as any).overallScoreDelta ?? null,
      pages: n,
      pagesNewThisSession: (wqa as any).newPagesThisSession ?? null,
      indexablePct: pct(indexable, n),
      indexableDeltaPct: (wqa as any).indexableDeltaPct ?? null,
      issues: totalIssues,
      issuesDelta: (wqa as any).issuesDelta ?? null,
      statusMix,
      depthHistogram: depthHist,
      categoryDonut,
      crawl: {
        isRunning: !!(wqa as any).crawlRunning,
        progressPct: (wqa as any).crawlProgressPct ?? 100,
        lastFinishedAt,
        durationMs,
        errors: errorTotal,
        blocked: blockedTotal,
      },
    },
    issues: {
      severity: (['critical','high','medium','low'] as Severity[])
        .map(tone => ({ tone, count: sevCounts[tone] })),
      byCategory: (Object.keys(catCountsIss) as IssueCategory[])
        .map(label => ({ label, count: catCountsIss[label] }))
        .sort((a, b) => b.count - a.count),
      top: topRows.slice(0, 6),
      trendAll, trendCritical,
      newThisSession:      (wqa as any).newIssuesThisSession      ?? 0,
      resolvedThisSession: (wqa as any).resolvedIssuesThisSession ?? 0,
      total: totalIssues,
    },
    scores: {
      overall,
      overallDelta: (wqa as any).overallScoreDelta ?? null,
      subscores,
      cohort,
      pageDistribution,
      movers: { up: movers?.up ?? 0, down: movers?.down ?? 0 },
    },
    crawl: {
      lastFinishedAt, durationMs,
      pagesCrawled: n, pagesDiscovered: discovered,
      pagesPerSec, avgResponseMs: avgResp,
      p90ResponseMs: p90Resp, p99ResponseMs: p99Resp,
      errors: { total: errorTotal, ...errors },
      blocked: { total: blockedTotal, ...blocked },
      sitemapParity: { inSitemapAndCrawl, inCrawlOnly, inSitemapOnly, total: sitemapTotal },
      renderSample,
    },
    integrations: { adapters, freshness, coverage, missing },
  }
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
