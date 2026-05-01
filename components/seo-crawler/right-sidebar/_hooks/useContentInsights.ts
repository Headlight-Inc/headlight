import { useMemo } from 'react'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'

type Page = any
export type ContentInsights = ReturnType<typeof computeContentInsights>

export function useContentInsights() {
    const crawler = useSeoCrawler()
    const { pages, crawlHistory, currentSessionId } = crawler
    const compareSession = (crawler as any).compareSession
    const prevPages: Page[] = compareSession?.pages || []
    return useMemo(
        () => computeContentInsights(pages || [], prevPages, crawlHistory, currentSessionId),
        [pages, prevPages, crawlHistory, currentSessionId]
    )
}

function computeContentInsights(
    pages: Page[],
    prev: Page[],
    history: any[],
    sessionId: string | null
) {
    const html = pages.filter(p => isHtml(p))
    const total = html.length
    if (total === 0) return EMPTY

    // ── Quality score (site-level) ─────────────────────────
    const scores = html.map(p => contentScore(p))
    const qOverall = avg(scores)
    const qPrev = avg(prev.filter(isHtml).map(p => contentScore(p)))
    const qBins = [
        { label: '0-20',   count: scores.filter(s => s < 20).length,           tone: 'bad'  as const },
        { label: '20-40',  count: scores.filter(s => s >= 20 && s < 40).length, tone: 'bad'  as const },
        { label: '40-60',  count: scores.filter(s => s >= 40 && s < 60).length, tone: 'warn' as const },
        { label: '60-80',  count: scores.filter(s => s >= 60 && s < 80).length, tone: 'good' as const },
        { label: '80-100', count: scores.filter(s => s >= 80).length,           tone: 'good' as const },
    ]

    // ── Inventory & category mix ───────────────────────────
    const categories = countBy(html, p => String(p.pageCategory || p.contentType || 'page').toLowerCase())
    const langs = countBy(html, p => String(p.lang || 'unknown').toLowerCase())
    const indexable = html.filter(p => p.indexable !== false).length

    // ── Word count distribution ────────────────────────────
    const wcDist = [
        { label: '<300',     count: html.filter(p => num(p.wordCount) < 300).length,                              tone: 'bad'  as const },
        { label: '300-800',  count: html.filter(p => num(p.wordCount) >= 300 && num(p.wordCount) < 800).length,   tone: 'warn' as const },
        { label: '800-1.5k', count: html.filter(p => num(p.wordCount) >= 800 && num(p.wordCount) < 1500).length,  tone: 'good' as const },
        { label: '1.5k-3k',  count: html.filter(p => num(p.wordCount) >= 1500 && num(p.wordCount) < 3000).length, tone: 'good' as const },
        { label: '3k+',      count: html.filter(p => num(p.wordCount) >= 3000).length,                            tone: 'good' as const },
    ]
    const wcMedian = median(html.map(p => num(p.wordCount)).filter(n => n > 0))
    const wcAvg = avg(html.map(p => num(p.wordCount)))
    const thin = html.filter(p => num(p.wordCount) < 300 || p.isThinContent).length
    const overstuffed = html.filter(p => p.hasKeywordStuffing).length

    // ── Readability ────────────────────────────────────────
    const flesch = html.map(p => parseFloat(p.fleschScore)).filter(Number.isFinite)
    const readAvg = avg(flesch)
    const readDist = [
        { label: 'Very easy',  count: flesch.filter(v => v >= 80).length, tone: 'good' as const },
        { label: 'Easy',       count: flesch.filter(v => v >= 60 && v < 80).length, tone: 'good' as const },
        { label: 'Standard',   count: flesch.filter(v => v >= 50 && v < 60).length, tone: 'warn' as const },
        { label: 'Difficult',  count: flesch.filter(v => v >= 30 && v < 50).length, tone: 'warn' as const },
        { label: 'Very hard',  count: flesch.filter(v => v < 30).length,             tone: 'bad'  as const },
    ]

    // ── Topics & clusters ──────────────────────────────────
    const clusters = groupBy(html, p => String(p.topicCluster || 'uncategorised'))
    const clusterRows = Object.entries(clusters)
        .map(([name, list]) => ({
            name,
            count: list.length,
            avgQuality: avg(list.map(p => contentScore(p))),
            stale: list.filter(p => num(p.daysSinceUpdate) > 365).length,
            thin: list.filter(p => num(p.wordCount) < 300).length,
            clicks: sum(list.map(p => num(p.gscClicks))),
        }))
        .sort((a, b) => b.count - a.count)
    const orphanTopics = clusterRows.filter(c => c.count <= 2).length
    const weakHubs = clusterRows.filter(c => c.count >= 3 && c.avgQuality < 50).length

    // ── Intent mix ─────────────────────────────────────────
    const intentMix = countBy(html, p => String(p.searchIntent || 'unknown').toLowerCase())

    // ── Cannibalization & duplication ─────────────────────
    const dupes = html.filter(p => p.isDuplicate || p.duplicateGroupId || p.exactDuplicate || p.nearDuplicateMatch)
    const exactDupes = html.filter(p => p.exactDuplicate).length
    const nearDupes = html.filter(p => !p.exactDuplicate && (p.nearDuplicateMatch || p.duplicateGroupId)).length
    const cannibal = html.filter(p => p.cannibalizationFlag).length
    const dupeGroups = groupBy(dupes, p => String(p.duplicateGroupId || 'ungrouped'))
    const topDupeGroups = Object.entries(dupeGroups)
        .filter(([k]) => k !== 'ungrouped')
        .map(([id, list]) => ({ id, count: list.length, sample: list[0]?.url }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    const crossLangDupes = countCrossLangDupes(html)
    const boilerplateRate = pct(
        html.filter(p => num(p.boilerplateRatio) >= 0.6 || p.containsLoremIpsum).length,
        total
    )

    // ── E-E-A-T ────────────────────────────────────────────
    const eeat = {
        bylines:   pct(html.filter(p => p.author || p.byline).length, total),
        bios:      pct(html.filter(p => p.authorBioPresent).length, total),
        citations: pct(html.filter(p => num(p.externalCitations) > 0).length, total),
        updated:   pct(html.filter(p => p.visibleDate).length, total),
        avgScore:  avg(html.map(p => num(p.eeatScore)).filter(v => v > 0)),
    }

    // ── Schema coverage ────────────────────────────────────
    const schemaCoverage = {
        any:       pct(html.filter(p => (p.schemaTypes?.length || 0) > 0).length, total),
        article:   pct(html.filter(p => hasSchema(p, 'Article')).length, total),
        product:   pct(html.filter(p => hasSchema(p, 'Product')).length, total),
        faq:       pct(html.filter(p => hasSchema(p, 'FAQPage')).length, total),
        howto:     pct(html.filter(p => hasSchema(p, 'HowTo')).length, total),
        breadcrumb:pct(html.filter(p => hasSchema(p, 'BreadcrumbList')).length, total),
        author:    pct(html.filter(p => hasSchema(p, 'Person') || hasSchema(p, 'Author')).length, total),
    }

    // ── Freshness ──────────────────────────────────────────
    const freshDays = html.map(p => num(p.daysSinceUpdate)).filter(n => n >= 0)
    const freshAvg = avg(freshDays)
    const freshBuckets = [
        { label: '<30d',    count: html.filter(p => inRange(p.daysSinceUpdate, 0, 30)).length,    tone: 'good' as const },
        { label: '30-90d',  count: html.filter(p => inRange(p.daysSinceUpdate, 30, 90)).length,   tone: 'good' as const },
        { label: '90-180d', count: html.filter(p => inRange(p.daysSinceUpdate, 90, 180)).length,  tone: 'warn' as const },
        { label: '6-12mo',  count: html.filter(p => inRange(p.daysSinceUpdate, 180, 365)).length, tone: 'warn' as const },
        { label: '1-2y',    count: html.filter(p => inRange(p.daysSinceUpdate, 365, 730)).length, tone: 'bad'  as const },
        { label: '2y+',     count: html.filter(p => num(p.daysSinceUpdate) >= 730).length,        tone: 'bad'  as const },
        { label: 'No date', count: html.filter(p => !p.visibleDate && !p.lastModified).length,    tone: 'neutral' as const },
    ]
    const stale = html.filter(p => num(p.daysSinceUpdate) > 365).length
    const decaying = html.filter(p => isDecaying(p)).length
    const evergreenDrift = html.filter(p => p.pageCategory === 'evergreen' && num(p.daysSinceUpdate) > 540).length

    // ── AI signals ─────────────────────────────────────────
    const aiLikely = html.filter(p => num(p.aiLikelihood) >= 0.7).length
    const lowOriginality = html.filter(p => num(p.originalityScore) > 0 && num(p.originalityScore) < 40).length

    // ── Top recommended actions (content) ──────────────────
    const actions = countBy(
        html.filter(p => p.recommendedAction || p.contentAction),
        p => String(p.contentAction || p.recommendedAction)
    )
    const topActions = Object.entries(actions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([title, count]) => ({
            title,
            count,
            priority: count >= 30 ? 'high' as const : count >= 10 ? 'med' as const : 'low' as const,
            forecast: estForecast(title, count),
        }))

    // ── Alerts ─────────────────────────────────────────────
    const alerts: { tone: 'bad' | 'warn'; text: string }[] = []
    if (thin > 0)         alerts.push({ tone: 'warn', text: `${thin} thin pages (<300 words)` })
    if (exactDupes > 0)   alerts.push({ tone: 'bad',  text: `${exactDupes} exact duplicates` })
    if (cannibal > 0)     alerts.push({ tone: 'warn', text: `${cannibal} cannibalising pairs` })
    if (stale > 0)        alerts.push({ tone: 'warn', text: `${stale} pages untouched 1y+` })
    if (decaying > 0)     alerts.push({ tone: 'warn', text: `${decaying} pages losing traffic` })
    if (eeat.bios < 30)   alerts.push({ tone: 'warn', text: `Only ${Math.round(eeat.bios)}% pages have author bios` })
    if (schemaCoverage.any < 40) alerts.push({ tone: 'warn', text: `${Math.round(schemaCoverage.any)}% schema coverage` })

    // ── History trend ──────────────────────────────────────
    const trend = (history || [])
        .filter(s => s?.completedAt)
        .slice(-12)
        .map(s => num(s.summary?.contentScore ?? s.summary?.qOverall ?? 0))

    return {
        total, indexable,
        qOverall, qPrev, qBins,
        categories, langs,
        wcDist, wcMedian, wcAvg, thin, overstuffed,
        readAvg, readDist,
        clusterRows, orphanTopics, weakHubs, intentMix,
        dupes: dupes.length, exactDupes, nearDupes, cannibal, topDupeGroups, crossLangDupes, boilerplateRate,
        eeat, schemaCoverage,
        freshAvg, freshBuckets, stale, decaying, evergreenDrift,
        aiLikely, lowOriginality,
        topActions, alerts, trend, history, sessionId,
    }
}

const EMPTY = {
    total: 0, indexable: 0,
    qOverall: 0, qPrev: 0, qBins: [],
    categories: {} as Record<string, number>, langs: {} as Record<string, number>,
    wcDist: [], wcMedian: 0, wcAvg: 0, thin: 0, overstuffed: 0,
    readAvg: 0, readDist: [],
    clusterRows: [] as Array<{ name: string; count: number; avgQuality: number; stale: number; thin: number; clicks: number }>,
    orphanTopics: 0, weakHubs: 0, intentMix: {} as Record<string, number>,
    dupes: 0, exactDupes: 0, nearDupes: 0, cannibal: 0, topDupeGroups: [] as Array<{ id: string; count: number; sample?: string }>, crossLangDupes: 0, boilerplateRate: 0,
    eeat: { bylines: 0, bios: 0, citations: 0, updated: 0, avgScore: 0 },
    schemaCoverage: { any: 0, article: 0, product: 0, faq: 0, howto: 0, breadcrumb: 0, author: 0 },
    freshAvg: 0, freshBuckets: [], stale: 0, decaying: 0, evergreenDrift: 0,
    aiLikely: 0, lowOriginality: 0,
    topActions: [] as Array<{ title: string; count: number; priority: 'high' | 'med' | 'low'; forecast?: string }>,
    alerts: [] as Array<{ tone: 'bad' | 'warn'; text: string }>,
    trend: [] as number[], history: [] as any[], sessionId: null as string | null,
}

// helpers
function num(v: any): number { const n = Number(v); return Number.isFinite(n) ? n : 0 }
function sum(a: number[]): number { return a.reduce((x, y) => x + y, 0) }
function avg(a: number[]): number { return a.length ? sum(a) / a.length : 0 }
function pct(part: number, total: number): number { return total > 0 ? (part / total) * 100 : 0 }
function median(a: number[]): number { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
function countBy<T>(arr: T[], k: (x: T) => string): Record<string, number> { const o: Record<string, number> = {}; for (const i of arr) { const key = k(i); o[key] = (o[key] || 0) + 1 } return o }
function groupBy<T>(arr: T[], k: (x: T) => string): Record<string, T[]> { const o: Record<string, T[]> = {}; for (const i of arr) { const key = k(i); (o[key] ||= []).push(i) } return o }
function inRange(v: any, lo: number, hi: number): boolean { const n = num(v); return n >= lo && n < hi }
function isHtml(p: any): boolean { return p && (p.isHtmlPage || String(p.contentType || '').includes('html')) }
function hasSchema(p: any, type: string): boolean { const t = p.schemaTypes || p.structuredDataTypes || []; return Array.isArray(t) ? t.some((x: string) => (x || '').includes(type)) : String(t).includes(type) }
function isDecaying(p: any): boolean { const d = String(p.contentDecay || '').toLowerCase(); return d.includes('decay') || p.isLosingTraffic === true || num(p.contentDecayVelocity) < -0.2 }
function countCrossLangDupes(html: any[]): number {
    const byHash: Record<string, Set<string>> = {}
    for (const p of html) { const h = String(p.contentHash || p.shingleHash || ''); if (!h) continue; (byHash[h] ||= new Set()).add(String(p.lang || '')) }
    return Object.values(byHash).filter(s => s.size > 1).length
}
function contentScore(p: any): number {
    if (num(p.contentQualityScore) > 0) return num(p.contentQualityScore)
    if (num(p.qualityScore) > 0) return num(p.qualityScore)
    let s = 50
    const wc = num(p.wordCount)
    if (wc >= 800) s += 25; else if (wc >= 400) s += 15; else if (wc >= 200) s += 5; else s -= 20
    const fl = parseFloat(p.fleschScore) || 0
    if (fl >= 60) s += 10; else if (fl > 0 && fl < 30) s -= 10
    if (p.exactDuplicate) s -= 25
    if (p.hasKeywordStuffing) s -= 15
    if (p.containsLoremIpsum) s -= 15
    if (!p.title || !p.metaDesc) s -= 5
    return Math.max(0, Math.min(100, s))
}
function estForecast(action: string, count: number): string {
    const map: Record<string, number> = {
        'Expand thin page': 0.3, 'Refresh decaying page': 0.4, 'Merge or remove': 0.1,
        'Rewrite for intent': 0.25, 'Add author bio': 0.05, 'Add schema': 0.15,
        'Improve readability': 0.1, 'Republish': 0.2, 'Add citations': 0.1,
    }
    const f = map[action] ?? 0.1
    const e = Math.round(count * f * 10)
    return e > 0 ? `+${e} clicks/mo` : ''
}
