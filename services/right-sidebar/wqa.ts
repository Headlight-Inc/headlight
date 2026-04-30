import {
  countWhere, isIndexable, hasTitle, hasMetaDescription, hasH1, isThin,
  pct, score100, topN,
} from './_helpers'
import {
  WqaOverviewTab, WqaActionsTab, WqaSearchTab, WqaTechTab, WqaContentTab,
} from '@/components/seo-crawler/right-sidebar/modes/wqa'
import type { RsDataDeps, RsModeBundle } from './types'

export interface WqaStats {
  overallScore: number
  scoreP50: number
  scoreP90: number
  radar: { axis: string; value: number }[]
  heroChips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info'|'neutral' }[]

  qualityHistogram: number[]            // 5 buckets: 0-20, 20-40, 40-60, 60-80, 80-100
  categoryMix: { name: string; count: number; pct: number }[]   // sorted desc, top 7 + "other"

  actions: {
    id: string
    label: string
    category: 'content'|'tech'|'links'|'merge'|'deprecate'
    priority: 'high'|'medium'|'low'
    effort: 'low'|'medium'|'high'
    impact: number                       // est click delta or affected count
    pagesAffected: number
    filter?: unknown
  }[]
  actionPriorityCounts: { high: number; medium: number; low: number }
  actionTypeCounts: Record<'content'|'tech'|'links'|'merge'|'deprecate', number>
  ownerLoad: { owner: string; count: number }[]
  forecast: { qDelta: number; clicksDelta: number; horizonDays: number; confidence: number } | null
  needsDecision: { rewrite: number; merge: number; expand: number; deprecate: number; total: number }

  search: {
    indexable: number; nonIndexable: number
    canonicalIssues: number
    sitemapMissing: number; sitemapTotal: number
    clicks28d: number; clicks28dDelta: number
    impr28d: number;   impr28dDelta: number
    ctr28d: number;    ctr28dDelta: number
    pos28d: number;    pos28dDelta: number
    clicksSeries: number[]
    imprSeries: number[]
    ctrSeries: number[]
    posSeries: number[]
    keywordBuckets: { ranking: number; top3: number; top10: number; striking: number; tail: number; notRanking: number }
    ctrVsBenchmark: { pos: number; us: number; benchmark: number }[]   // pos 1..3
    movers: { url: string; delta: number; direction: 'up'|'down' }[]
    lostPages: { url: string }[]
  }

  tech: {
    statusMix: { code: '2xx'|'3xx'|'4xx'|'5xx'; count: number }[]
    indexableCount: number; noindexCount: number; blockedCount: number; canonMismatchCount: number
    renderMix: { static: number; ssr: number; csr: number }
    responseP50: number | null
    responseP90: number | null
    responseP99: number | null
    cwv: { lcpP50: number|null; lcpP75: number|null; inpP50: number|null; clsP50: number|null }
    structural: { orphans: number; deep: number; redirectChains: number; mixedContent: number }
    httpsPct: number
    heavyPages: number
    slowPages: number
  }

  content: {
    withTitle: number; withDesc: number; withH1: number
    thin: number
    avgWords: number
    dupTitles: number; dupDescriptions: number
    wordsHistogram: number[]            // 5 buckets: <300, 300-800, 800-1500, 1500-3000, 3000+
    readabilityHistogram: number[]      // 4 buckets: <40, 40-60, 60-80, 80+
    readabilityAvg: number | null
    freshnessHistogram: number[]        // 5 buckets: <7d, <30d, <90d, <1y, >1y
    duplication: { nearDupeGroups: number; cannibalPairs: number; exactDupes: number }
    eeat: { byline: number; updatedDate: number; citations: number; authorBio: number; total: number }
    schemaCoverage: { article: number; product: number; faq: number; howto: number; total: number }
  }
}

const HIST = (vals: number[], edges: number[]): number[] => {
  const out = new Array(edges.length - 1).fill(0)
  for (const v of vals) {
    for (let i = 0; i < edges.length - 1; i++) {
      if (v >= edges[i] && v < edges[i + 1]) { out[i]++; break }
    }
  }
  return out
}
const percentile = (xs: number[], p: number): number => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const i = Math.min(s.length - 1, Math.floor((p / 100) * s.length))
  return s[i]
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function computeWqaStats(deps: RsDataDeps): WqaStats {
  const pages = deps.pages
  const n = pages.length || 1
  const ws = (deps.wqaState || {}) as Record<string, any>

  // ── Coverage primitives ──
  const indexable = countWhere(pages, isIndexable)
  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const https     = countWhere(pages, p => (p.url || '').startsWith('https://'))

  // ── Per-page quality scores ──
  const perPageQ: number[] = pages.map(p => {
    let v = 0, w = 0
    if (p.healthScore != null)        { v += Number(p.healthScore);        w++ }
    if (p.contentQualityScore != null){ v += Number(p.contentQualityScore);w++ }
    if (p.eeatScore != null)          { v += Number(p.eeatScore);          w++ }
    return w ? v / w : 50
  })
  const overallScore = Math.round(sum(perPageQ) / Math.max(perPageQ.length, 1))
  const scoreP50 = Math.round(percentile(perPageQ, 50))
  const scoreP90 = Math.round(percentile(perPageQ, 90))
  const qualityHistogram = HIST(perPageQ, [0, 20, 40, 60, 80, 101])

  // ── Category mix ──
  const catCount: Record<string, number> = {}
  for (const p of pages) catCount[p.pageCategory || 'other'] = (catCount[p.pageCategory || 'other'] || 0) + 1
  const catSorted = Object.entries(catCount).sort((a, b) => b[1] - a[1])
  const top7 = catSorted.slice(0, 7)
  const otherCount = catSorted.slice(7).reduce((s, [, c]) => s + c, 0)
  const categoryMix = [
    ...top7.map(([name, count]) => ({ name, count, pct: Math.round((count / n) * 100) })),
    ...(otherCount > 0 ? [{ name: 'other', count: otherCount, pct: Math.round((otherCount / n) * 100) }] : []),
  ]

  // ── Title/meta dupes + word stats ──
  const titles = new Map<string, number>()
  const descs  = new Map<string, number>()
  let wordSum = 0, respCount = 0, respSum = 0, heavy = 0, slow = 0
  const respTimes: number[] = []
  const wordCounts: number[] = []
  const readabilities: number[] = []
  const ages: number[] = []
  for (const p of pages) {
    if (p.title)    titles.set(p.title, (titles.get(p.title) ?? 0) + 1)
    if (p.metaDesc) descs.set(p.metaDesc, (descs.get(p.metaDesc) ?? 0) + 1)
    const w = Number(p.wordCount || 0); wordSum += w; wordCounts.push(w)
    if (p.loadTime) { respSum += p.loadTime; respCount++; respTimes.push(p.loadTime) }
    if ((p.transferredBytes || 0) > 1024 * 1024 * 2) heavy++
    if ((p.loadTime || 0) > 2500) slow++
    if (p.fleschScore != null) readabilities.push(Number(p.fleschScore))
    if (p.contentAge != null)  ages.push(Number(p.contentAge))
  }
  const dupTitles = Array.from(titles.values()).filter(v => v > 1).reduce((s, v) => s + v, 0)
  const dupDescs  = Array.from(descs.values()).filter(v => v > 1).reduce((s, v) => s + v, 0)
  const avgWords  = Math.round(wordSum / n)

  // ── Search aggregates ──
  const clicks28d = sum(pages.map(p => Number(p.gscClicks || 0)))
  const impr28d   = sum(pages.map(p => Number(p.gscImpressions || 0)))
  const ctr28d    = impr28d ? clicks28d / impr28d : 0
  const positions = pages.map(p => Number(p.gscPosition || 0)).filter(v => v > 0)
  const pos28d    = positions.length ? sum(positions) / positions.length : 0
  const sumSeries = (key: string) => {
    const len = pages.find(p => Array.isArray(p[key]))?.[key]?.length || 0
    if (!len) return []
    const out = new Array(len).fill(0)
    for (const p of pages) {
      const s = Array.isArray(p[key]) ? p[key] : []
      for (let i = 0; i < Math.min(s.length, len); i++) out[i] += Number(s[i] || 0)
    }
    return out
  }
  const clicksSeries = sumSeries('gscClicksSeries28d')
  const imprSeries   = sumSeries('gscImpressionsSeries28d')
  const ctrSeries    = clicksSeries.map((c, i) => imprSeries[i] ? c / imprSeries[i] : 0)
  const posSeries    = sumSeries('gscPositionSeries28d').map((s, i) => positions.length ? s / positions.length : 0)
  const keywordBuckets = {
    ranking:    countWhere(pages, p => Number(p.gscPosition || 0) > 0 && Number(p.gscPosition || 0) <= 100),
    top3:       countWhere(pages, p => Number(p.gscPosition || 0) > 0 && Number(p.gscPosition || 0) <= 3),
    top10:      countWhere(pages, p => Number(p.gscPosition || 0) > 3 && Number(p.gscPosition || 0) <= 10),
    striking:   countWhere(pages, p => Number(p.gscPosition || 0) >= 11 && Number(p.gscPosition || 0) <= 20),
    tail:       countWhere(pages, p => Number(p.gscPosition || 0) >= 21 && Number(p.gscPosition || 0) <= 50),
    notRanking: countWhere(pages, p => !p.gscPosition || Number(p.gscPosition) === 0),
  }
  const ctrAtPos = (pos: number): number => {
    const xs = pages.filter(p => Math.round(Number(p.gscPosition || 0)) === pos).map(p => Number(p.gscCtr || 0))
    return xs.length ? sum(xs) / xs.length : 0
  }
  const benchmarkCtr: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.11 }
  const ctrVsBenchmark = [1, 2, 3].map(pos => ({ pos, us: ctrAtPos(pos), benchmark: benchmarkCtr[pos] }))
  const movers = pages
    .filter(p => Number(p.gscClicksDelta28d || 0) !== 0)
    .sort((a, b) => Math.abs(Number(b.gscClicksDelta28d || 0)) - Math.abs(Number(a.gscClicksDelta28d || 0)))
    .slice(0, 8)
    .map(p => ({ url: p.url, delta: Number(p.gscClicksDelta28d), direction: Number(p.gscClicksDelta28d) > 0 ? 'up' as const : 'down' as const }))
  const lostPages = pages.filter(p => p.lostFromTop50 === true).slice(0, 6).map(p => ({ url: p.url }))

  // ── Tech aggregates ──
  const statusMix = (['2xx','3xx','4xx','5xx'] as const).map(code => ({
    code,
    count: countWhere(pages, p => {
      const c = Number(p.statusCode || 0)
      if (code === '2xx') return c >= 200 && c < 300
      if (code === '3xx') return c >= 300 && c < 400
      if (code === '4xx') return c >= 400 && c < 500
      return c >= 500 && c < 600
    }),
  }))
  const renderMix = {
    static: countWhere(pages, p => p.renderMode === 'static' || (p.renderMode == null && p.isHtmlPage)),
    ssr:    countWhere(pages, p => p.renderMode === 'ssr'),
    csr:    countWhere(pages, p => p.renderMode === 'csr'),
  }
  const orphans = countWhere(pages, p => Number(p.inlinks || 0) === 0)
  const deep = countWhere(pages, p => Number(p.crawlDepth || 0) > 5)
  const redirectChains = countWhere(pages, p => Number(p.redirectChainLength || 0) > 1)
  const mixedContent = countWhere(pages, p => p.mixedContent === true)
  const sortedResp = [...respTimes].sort((a, b) => a - b)
  const pAt = (xs: number[], p: number) => xs.length ? Math.round(xs[Math.min(xs.length - 1, Math.floor((p / 100) * xs.length))]) : null

  // ── Content distributions ──
  const wordsHistogram       = HIST(wordCounts,    [0, 300, 800, 1500, 3000, Number.POSITIVE_INFINITY])
  const readabilityHistogram = HIST(readabilities, [0, 40, 60, 80, 101])
  const readabilityAvg       = readabilities.length ? Math.round(sum(readabilities) / readabilities.length) : null
  const freshnessHistogram   = HIST(ages,          [0, 7, 30, 90, 365, Number.POSITIVE_INFINITY])

  const duplication = {
    nearDupeGroups: new Set(pages.filter(p => p.nearDuplicateGroupId).map(p => p.nearDuplicateGroupId)).size,
    cannibalPairs:  countWhere(pages, p => p.isCannibalized === true),
    exactDupes:     countWhere(pages, p => p.exactDuplicate === true),
  }
  const eeatBase = countWhere(pages, p => p.isHtmlPage !== false) || n
  const eeat = {
    byline:      Math.round((countWhere(pages, p => !!p.author || !!p.wpAuthorName) / eeatBase) * 100),
    updatedDate: Math.round((countWhere(pages, p => !!p.lastModified) / eeatBase) * 100),
    citations:   Math.round((countWhere(pages, p => Number(p.externalCitationsCount || 0) > 0) / eeatBase) * 100),
    authorBio:   Math.round((countWhere(pages, p => !!p.authorBioPresent) / eeatBase) * 100),
    total:       eeatBase,
  }
  const schemaCoverage = {
    article: Math.round((countWhere(pages, p => (p.schemaTypes || []).includes('Article') || (p.schemaTypes || []).includes('NewsArticle')) / eeatBase) * 100),
    product: Math.round((countWhere(pages, p => (p.schemaTypes || []).includes('Product')) / eeatBase) * 100),
    faq:     Math.round((countWhere(pages, p => (p.schemaTypes || []).includes('FAQPage')) / eeatBase) * 100),
    howto:   Math.round((countWhere(pages, p => (p.schemaTypes || []).includes('HowTo')) / eeatBase) * 100),
    total:   eeatBase,
  }

  // ── Radar (5 axes) ──
  const radar = [
    { axis: 'Content',  value: score100([
      { weight: 1, value: pct(withTitle, n) },
      { weight: 1, value: pct(withDesc, n)  },
      { weight: 1, value: pct(withH1, n)    },
      { weight: 1, value: 100 - pct(thin, n) },
    ]) },
    { axis: 'SEO',       value: score100([
      { weight: 2, value: pct(indexable, n) },
      { weight: 1, value: 100 - pct(dupTitles, n) },
      { weight: 1, value: 100 - pct(dupDescs, n) },
    ]) },
    { axis: 'Authority', value: 50 },
    { axis: 'UX',        value: respCount === 0 ? 50 : Math.max(0, Math.min(100, 100 - ((respSum / respCount) / 30))) },
    { axis: 'Trust',     value: pct(https, n) },
  ]

  // ── Hero chips ──
  const heroChips: WqaStats['heroChips'] = [
    { label: 'Indexable', value: `${pct(indexable, n)}%`, tone: pct(indexable, n) >= 80 ? 'good' : 'warn' },
    { label: 'HTTPS',     value: `${pct(https, n)}%`,    tone: pct(https, n) >= 95 ? 'good' : 'bad' },
    { label: 'Avg words', value: avgWords.toString(),    tone: avgWords > 600 ? 'good' : avgWords > 300 ? 'warn' : 'bad' },
  ]
  if (ws.detectedCms)      heroChips.push({ label: 'CMS',  value: ws.detectedCms, tone: 'info' })
  if (ws.detectedLanguage) heroChips.push({ label: 'Lang', value: ws.detectedLanguage, tone: 'info' })

  // ── Actions (typed + prioritized) ──
  type A = WqaStats['actions'][number]
  const rawActions: A[] = [
    { id: 'add-titles',     label: `Add titles to ${n - withTitle} pages`,       category: 'content', priority: 'high',   effort: 'low',    impact: n - withTitle, pagesAffected: n - withTitle },
    { id: 'add-desc',       label: `Add descriptions to ${n - withDesc} pages`,  category: 'content', priority: 'medium', effort: 'low',    impact: n - withDesc,  pagesAffected: n - withDesc  },
    { id: 'add-h1',         label: `Add H1 to ${n - withH1} pages`,              category: 'content', priority: 'medium', effort: 'low',    impact: n - withH1,    pagesAffected: n - withH1    },
    { id: 'expand-thin',    label: `Expand ${thin} thin pages (<300 words)`,     category: 'content', priority: 'high',   effort: 'medium', impact: thin,          pagesAffected: thin          },
    { id: 'fix-dup-titles', label: `Resolve ${dupTitles} duplicate titles`,      category: 'content', priority: 'medium', effort: 'medium', impact: dupTitles,     pagesAffected: dupTitles     },
    { id: 'fix-dup-desc',   label: `Resolve ${dupDescs} duplicate descriptions`, category: 'content', priority: 'low',    effort: 'medium', impact: dupDescs,      pagesAffected: dupDescs      },
    { id: 'speed-up',       label: `Speed up ${slow} slow pages (>2.5s)`,        category: 'tech',    priority: 'high',   effort: 'high',   impact: slow,          pagesAffected: slow          },
    { id: 'shrink-heavy',   label: `Shrink ${heavy} heavy pages (>2MB)`,         category: 'tech',    priority: 'medium', effort: 'medium', impact: heavy,         pagesAffected: heavy         },
    { id: 'reclaim-orphan', label: `Reclaim ${orphans} orphan pages`,            category: 'links',   priority: 'medium', effort: 'low',    impact: orphans,       pagesAffected: orphans       },
    { id: 'merge-near-dup', label: `Merge ${duplication.nearDupeGroups} near-dup groups`, category: 'merge', priority: 'medium', effort: 'medium', impact: duplication.nearDupeGroups, pagesAffected: duplication.nearDupeGroups * 2 },
    { id: 'fix-canon',      label: `Fix ${countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url)} canonical mismatches`, category: 'tech', priority: 'medium', effort: 'low', impact: countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url), pagesAffected: countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url) },
    { id: 'fix-redirect-chains', label: `Shorten ${redirectChains} redirect chains`, category: 'tech', priority: 'low', effort: 'medium', impact: redirectChains, pagesAffected: redirectChains },
  ].filter(a => a.impact > 0)

  const actions = topN(rawActions, 50, a => a.impact)
  const actionPriorityCounts = {
    high:   actions.filter(a => a.priority === 'high').length,
    medium: actions.filter(a => a.priority === 'medium').length,
    low:    actions.filter(a => a.priority === 'low').length,
  }
  const actionTypeCounts = {
    content:   actions.filter(a => a.category === 'content').length,
    tech:      actions.filter(a => a.category === 'tech').length,
    links:     actions.filter(a => a.category === 'links').length,
    merge:     actions.filter(a => a.category === 'merge').length,
    deprecate: actions.filter(a => a.category === 'deprecate').length,
  }
  const ownerCount: Record<string, number> = {}
  for (const p of pages) {
    const o = String(p.ownerEmail || p.assigneeEmail || 'Unassigned')
    if ((p.recommendedAction && p.recommendedAction !== 'Monitor') || p.technicalAction) {
      ownerCount[o] = (ownerCount[o] || 0) + 1
    }
  }
  const ownerLoad = Object.entries(ownerCount).map(([owner, count]) => ({ owner, count })).sort((a, b) => b.count - a.count).slice(0, 6)

  const highImpactSum = actions.filter(a => a.priority === 'high').reduce((s, a) => s + a.impact, 0)
  const forecast = highImpactSum > 0 ? {
    qDelta: Math.min(20, Math.round(highImpactSum / Math.max(n, 1) * 8)),
    clicksDelta: Math.round(highImpactSum * 4),
    horizonDays: 60,
    confidence: 0.72,
  } : null

  const needsDecision = {
    rewrite:   countWhere(pages, p => p.recommendedAction === 'REWRITE' || p.recommendedAction === 'REWRITE + EXPAND'),
    merge:     countWhere(pages, p => p.recommendedAction === 'MERGE'),
    expand:    countWhere(pages, p => p.recommendedAction === 'EXPAND' || p.recommendedAction === 'EXPAND ONLY'),
    deprecate: countWhere(pages, p => p.recommendedAction === 'DEPRECATE'),
    total: 0,
  }
  needsDecision.total = needsDecision.rewrite + needsDecision.merge + needsDecision.expand + needsDecision.deprecate

  return {
    overallScore, scoreP50, scoreP90, radar, heroChips,
    qualityHistogram, categoryMix,
    actions,
    actionPriorityCounts, actionTypeCounts, ownerLoad, forecast, needsDecision,
    search: {
      indexable, nonIndexable: n - indexable,
      canonicalIssues: countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url),
      sitemapMissing: countWhere(pages, p => p.inSitemap === false), sitemapTotal: n,
      clicks28d, clicks28dDelta: Number(ws.clicksDeltaPct || 0),
      impr28d,   impr28dDelta:   Number(ws.imprDeltaPct || 0),
      ctr28d,    ctr28dDelta:    Number(ws.ctrDeltaPct || 0),
      pos28d,    pos28dDelta:    Number(ws.posDelta || 0),
      clicksSeries, imprSeries, ctrSeries, posSeries,
      keywordBuckets, ctrVsBenchmark, movers, lostPages,
    },
    tech: {
      statusMix,
      indexableCount: indexable,
      noindexCount:    countWhere(pages, p => p.metaRobots1?.includes('noindex') || p.indexable === false),
      blockedCount:    countWhere(pages, p => p.indexabilityStatus === 'Blocked' || p.blockedByRobots === true),
      canonMismatchCount: countWhere(pages, p => !!p.canonicalUrl && p.canonicalUrl !== p.url),
      renderMix,
      responseP50: pAt(sortedResp, 50),
      responseP90: pAt(sortedResp, 90),
      responseP99: pAt(sortedResp, 99),
      cwv: {
        lcpP50: pAt(pages.map(p => Number(p.lcp || 0)).filter(v => v > 0).sort((a, b) => a - b), 50),
        lcpP75: pAt(pages.map(p => Number(p.lcp || 0)).filter(v => v > 0).sort((a, b) => a - b), 75),
        inpP50: pAt(pages.map(p => Number(p.inp || 0)).filter(v => v > 0).sort((a, b) => a - b), 50),
        clsP50: pAt(pages.map(p => Number((p.cls || 0) * 1000)).filter(v => v > 0).sort((a, b) => a - b), 50),
      },
      structural: { orphans, deep, redirectChains, mixedContent },
      httpsPct: pct(https, n),
      heavyPages: heavy,
      slowPages: slow,
    },
    content: {
      withTitle, withDesc, withH1, thin,
      avgWords, dupTitles, dupDescriptions: dupDescs,
      wordsHistogram, readabilityHistogram, readabilityAvg, freshnessHistogram,
      duplication, eeat, schemaCoverage,
    },
  }
}

export const wqaBundle: RsModeBundle<WqaStats> = {
  mode: 'wqa',
  accent: 'violet',
  defaultTabId: 'wqa_overview',
  tabs: [
    { id: 'wqa_overview', label: 'Overview', Component: WqaOverviewTab },
    { id: 'wqa_actions',  label: 'Actions',  Component: WqaActionsTab  },
    { id: 'wqa_search',   label: 'Search',   Component: WqaSearchTab   },
    { id: 'wqa_tech',     label: 'Tech',     Component: WqaTechTab     },
    { id: 'wqa_content',  label: 'Content',  Component: WqaContentTab  },
  ],
  computeStats: computeWqaStats,
}
