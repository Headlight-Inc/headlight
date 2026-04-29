import type { WqaSiteStats } from '../../WebsiteQualityModeTypes'
import type { ActionGroup, ActionCategory, Decision } from './types'

// Quality histogram for Overview
export function qualityHistogram(pages: any[]): Array<{ name: string; value: number; tone?: string }> {
  const buckets = [0, 0, 0, 0, 0]
  for (const p of pages) {
    const q = Number(p.healthScore || p.contentQualityScore || 0)
    if (q < 20) buckets[0]++
    else if (q < 40) buckets[1]++
    else if (q < 60) buckets[2]++
    else if (q < 80) buckets[3]++
    else buckets[4]++
  }
  const tones = ['#fb7185', '#f59e0b', '#fbbf24', '#60a5fa', '#34d399']
  return ['0–20', '20–40', '40–60', '60–80', '80–100'].map((name, i) => ({ name, value: buckets[i], tone: tones[i] }))
}

// Page categories % strip for Overview
export function pageCategoriesShare(stats: WqaSiteStats): Array<{ name: string; value: number; color: string }> {
  const total = Math.max(1, stats.totalPages)
  const palette = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#94a3b8']
  return Object.entries(stats.pagesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count], i) => ({ name, value: Math.round((count / total) * 100), color: palette[i] }))
}

// Decision counts for Overview "Needs decision"
export function decisionCounts(facets: { decisions: { rewrite: number; merge: number; expand: number; deprecate: number; monitor: number } }) {
  return [
    { key: 'rewrite' as Decision, label: 'Rewrite', value: facets.decisions.rewrite },
    { key: 'merge' as Decision, label: 'Merge', value: facets.decisions.merge },
    { key: 'expand' as Decision, label: 'Expand', value: facets.decisions.expand },
    { key: 'deprecate' as Decision, label: 'Deprecate', value: facets.decisions.deprecate },
  ]
}

// Industry-aware KPI strip for Overview
export function categoryKpis(stats: WqaSiteStats, industry: string) {
  const total = Math.max(1, stats.totalPages)
  if (industry === 'news' || industry === 'blog') {
    return [
      { label: 'Articles',     value: stats.pagesByCategory['article'] || 0 },
      { label: 'Q-avg',        value: Math.round(stats.avgContentQuality || 0) },
      { label: 'Fresh %',      value: Math.round(((1 - (stats.thinContentRate || 0)) * 100)) + '%' },
      { label: 'Schema cov.',  value: Math.round((stats.schemaCoverage || 0) * 100) + '%' },
    ]
  }
  if (industry === 'ecommerce') {
    return [
      { label: 'Products',     value: stats.pagesByCategory['product'] || 0 },
      { label: 'PLPs',         value: stats.pagesByCategory['category'] || 0 },
      { label: 'Schema cov.',  value: Math.round((stats.schemaCoverage || 0) * 100) + '%' },
      { label: 'Q-avg',        value: Math.round(stats.avgContentQuality || 0) },
    ]
  }
  if (industry === 'saas') {
    return [
      { label: 'Docs',         value: stats.pagesByCategory['doc'] || 0 },
      { label: 'Pricing',      value: stats.pagesByCategory['pricing'] || 0 },
      { label: 'Q-avg',        value: Math.round(stats.avgContentQuality || 0) },
      { label: 'Index ratio',  value: Math.round((stats.indexedPages / total) * 100) + '%' },
    ]
  }
  return [
    { label: 'Pages',         value: stats.totalPages },
    { label: 'Indexable',     value: Math.round((stats.indexedPages / total) * 100) + '%' },
    { label: 'Schema cov.',   value: Math.round((stats.schemaCoverage || 0) * 100) + '%' },
    { label: 'Q-avg',         value: Math.round(stats.avgContentQuality || 0) },
  ]
}

// Position histogram for Search
export function positionHistogram(pages: any[]): Array<{ name: string; value: number; tone: string }> {
  const b = [0, 0, 0, 0, 0]
  for (const p of pages) {
    const pos = Number(p.gscPosition || 0)
    if (pos <= 0 || Number(p.gscImpressions || 0) === 0) continue
    if (pos <= 3) b[0]++
    else if (pos <= 10) b[1]++
    else if (pos <= 20) b[2]++
    else if (pos <= 50) b[3]++
    else b[4]++
  }
  return [
    { name: '1–3',   value: b[0], tone: '#22c55e' },
    { name: '4–10',  value: b[1], tone: '#3b82f6' },
    { name: '11–20', value: b[2], tone: '#F5364E' },
    { name: '21–50', value: b[3], tone: '#f59e0b' },
    { name: '51+',   value: b[4], tone: '#888' },
  ]
}

// CTR vs benchmark for Search (industry-aware curve)
export function ctrVsBenchmark(pages: any[]): Array<{ pos: number; actual: number; expected: number }> {
  const expectedByPos: Record<number, number> = {
    1: 0.31, 2: 0.24, 3: 0.18, 4: 0.13, 5: 0.09,
    6: 0.07, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.025,
  }
  const sums: Record<number, { c: number; n: number }> = {}
  for (const p of pages) {
    const pos = Math.round(Number(p.gscPosition || 0))
    const impr = Number(p.gscImpressions || 0)
    if (pos < 1 || pos > 10 || impr < 30) continue
    const ctr = Number(p.gscCtr || 0)
    sums[pos] = sums[pos] || { c: 0, n: 0 }
    sums[pos].c += ctr
    sums[pos].n += 1
  }
  return Object.entries(sums).map(([pos, v]) => ({
    pos: Number(pos),
    actual: v.n ? v.c / v.n : 0,
    expected: expectedByPos[Number(pos)] || 0,
  })).sort((a, b) => a.pos - b.pos)
}

// Word count distribution for Content
export function wordCountDistribution(pages: any[]): Array<{ name: string; value: number; tone: string }> {
  const b = [0, 0, 0, 0, 0]
  for (const p of pages) {
    const w = Number(p.wordCount || 0)
    if (w < 100) b[0]++
    else if (w < 300) b[1]++
    else if (w < 800) b[2]++
    else if (w < 1500) b[3]++
    else b[4]++
  }
  return [
    { name: '<100',     value: b[0], tone: '#fb7185' },
    { name: '100–300',  value: b[1], tone: '#f59e0b' },
    { name: '300–800',  value: b[2], tone: '#3b82f6' },
    { name: '800–1500', value: b[3], tone: '#22c55e' },
    { name: '1500+',    value: b[4], tone: '#34d399' },
  ]
}

// Status mix for Tech
export function statusMix(pages: any[]) {
  let s2 = 0, s3 = 0, s4 = 0, s5 = 0, sx = 0
  for (const p of pages) {
    const c = Number(p.statusCode || 0)
    if (!c) sx++
    else if (c < 300) s2++
    else if (c < 400) s3++
    else if (c < 500) s4++
    else s5++
  }
  return [
    { name: '2xx', value: s2, tone: '#22c55e' },
    { name: '3xx', value: s3, tone: '#3b82f6' },
    { name: '4xx', value: s4, tone: '#fb7185' },
    { name: '5xx', value: s5, tone: '#ef4444' },
    { name: '—',   value: sx, tone: '#666' },
  ]
}

// Render mix for Tech
export function renderMix(pages: any[]) {
  let stat = 0, ssr = 0, csr = 0, unk = 0
  for (const p of pages) {
    const r = String(p.renderType || (p.requiresJs ? 'csr' : 'static')).toLowerCase()
    if (r === 'ssr') ssr++
    else if (r === 'csr') csr++
    else if (r === 'static' || r === 'html') stat++
    else unk++
  }
  return [
    { name: 'Static', value: stat, tone: '#22c55e' },
    { name: 'SSR',    value: ssr,  tone: '#3b82f6' },
    { name: 'CSR',    value: csr,  tone: '#f59e0b' },
    { name: '—',      value: unk,  tone: '#666' },
  ]
}

// TTFB percentiles for Tech
export function ttfbPercentiles(pages: any[]): { p50: number; p75: number; p90: number } {
  const arr = pages.map(p => Number(p.ttfb || p.serverResponseTime || 0)).filter(v => v > 0).sort((a, b) => a - b)
  if (!arr.length) return { p50: 0, p75: 0, p90: 0 }
  const at = (q: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))]
  return { p50: at(0.5), p75: at(0.75), p90: at(0.9) }
}

// Owner load for Actions
export function ownerLoad(groups: ActionGroup[]): Array<{ owner: string; pages: number }> {
  const map = new Map<string, number>()
  for (const g of groups) {
    const owner = g.category === 'technical' ? 'Engineering'
      : g.category === 'content' ? 'Content'
      : g.category === 'links' ? 'SEO'
      : g.category === 'structured' ? 'SEO'
      : g.category === 'commerce' ? 'Merchandising'
      : 'PM'
    map.set(owner, (map.get(owner) || 0) + g.pageCount)
  }
  return [...map.entries()].map(([owner, pages]) => ({ owner, pages })).sort((a, b) => b.pages - a.pages)
}

// Top losers / quick wins for Search — already shown in tab; helper for tests
export function topLosers(pages: any[], n = 5) {
  return pages
    .filter(p => p.isLosingTraffic && Number(p.gscImpressions || 0) > 100)
    .sort((a, b) => Number(a.sessionsDeltaPct || 0) - Number(b.sessionsDeltaPct || 0))
    .slice(0, n)
}
export function quickWins(pages: any[], n = 5) {
  return pages
    .filter(p => {
      const pos = Number(p.gscPosition || 0)
      return pos > 3 && pos <= 20 && Number(p.gscImpressions || 0) > 100
    })
    .sort((a, b) => Number(b.gscImpressions || 0) - Number(a.gscImpressions || 0))
    .slice(0, n)
}
