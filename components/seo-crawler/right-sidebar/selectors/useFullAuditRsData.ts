import { useMemo } from 'react'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'

export type StatusBucket = '2xx' | '3xx' | '4xx' | '5xx' | 'other'

export type FullAuditRsData = {
    counts: {
        total: number
        indexable: number
        nonIndexable: number
        inSitemap: number
        notInSitemap: number
        orphans: number
        broken: number
        redirects: number
        serverErrors: number
        blocked: number
        canonicalIssues: number
    }
    statusMix: { bucket: StatusBucket; value: number }[]
    depth:     { label: string; value: number }[]
    template:  { label: string; value: number }[]
    issues: {
        critical: number
        high: number
        medium: number
        low: number
        notice: number
        byCategory: { label: string; value: number }[]
        topIssues: { label: string; value: number }[]
        new: number
        resolved: number
    }
    scores: {
        overall: number
        components: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' }[]
        distribution: { label: string; value: number }[]   // page Q score buckets
        movers: { up: number; down: number }
    }
    crawl: {
        lastRunAt: string | null
        durationMs: number | null
        pages: number
        budget: number
        avgMs: number
        p90Ms: number
        p99Ms: number
        errors: { timeout: number; server: number; parse: number; dns: number }
        blocked: { robots: number; meta: number; forbidden: number }
        sitemapParity: { matched: number; crawlOnly: number; sitemapOnly: number }
        renderMix: { static: number; ssr: number; csr: number }
    }
    integrations: {
        gsc: 'connected' | 'disconnected' | 'error'
        ga4: 'connected' | 'disconnected' | 'error'
        bing: 'connected' | 'disconnected' | 'error'
        gbp: 'connected' | 'disconnected' | 'error'
        backlinks: 'connected' | 'disconnected' | 'error'
        keywords: 'connected' | 'disconnected' | 'error'
        coverage: { gsc: number; gscPct: number; kw: number; kwPct: number; bl: number; blPct: number }
        freshness: { gsc: string | null; ga4: string | null; backlinks: string | null }
    }
}

const bucketStatus = (s: number): StatusBucket => {
    if (s >= 200 && s < 300) return '2xx'
    if (s >= 300 && s < 400) return '3xx'
    if (s >= 400 && s < 500) return '4xx'
    if (s >= 500 && s < 600) return '5xx'
    return 'other'
}

const safe = (n: any) => Number.isFinite(Number(n)) ? Number(n) : 0

export function useFullAuditRsData(): FullAuditRsData {
    const { pages, healthScore, integrationConnections, crawlRuntime } = useSeoCrawler()

    return useMemo<FullAuditRsData>(() => {
        const list = Array.isArray(pages) ? pages : []
        const total = list.length

        // Counts
        let indexable = 0, nonIndexable = 0, inSitemap = 0, notInSitemap = 0, orphans = 0
        let broken = 0, redirects = 0, serverErrors = 0, blocked = 0, canonicalIssues = 0
        const statusCounts: Record<StatusBucket, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, other: 0 }
        const depthBins: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 }
        const templateBins: Record<string, number> = {}

        // Issue accumulators (mirror SEO_ISSUES_TAXONOMY severity bands)
        let critical = 0, high = 0, medium = 0, low = 0, notice = 0
        const categoryCount: Record<string, number> = {}
        const issueLabelCount: Record<string, number> = {}

        // Score distribution from page-level techHealthScore + contentQualityScore (if present)
        const scoreBuckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 }
        let scoreSum = 0, scoreN = 0, moversUp = 0, moversDown = 0

        // Crawl perf accumulators
        const ttfb: number[] = []
        const renderMix = { static: 0, ssr: 0, csr: 0 }
        const errCounts = { timeout: 0, server: 0, parse: 0, dns: 0 }
        const blkCounts = { robots: 0, meta: 0, forbidden: 0 }

        for (const p of list) {
            // status
            const code = safe(p.statusCode)
            const b = bucketStatus(code)
            statusCounts[b]++
            if (b === '4xx') broken++
            if (b === '3xx') redirects++
            if (b === '5xx') serverErrors++

            // indexability
            if (p.indexable === false) nonIndexable++
            else indexable++

            // sitemap
            if (p.inSitemap === true) inSitemap++
            else if (p.inSitemap === false) notInSitemap++

            // orphan
            if (safe(p.inlinks) === 0 && safe(p.crawlDepth) > 0) orphans++

            // blocked / canonical
            if (typeof p.status === 'string' && p.status.toLowerCase().includes('blocked')) blocked++
            if (p.canonical && p.canonical !== p.url) canonicalIssues++

            // depth
            const d = safe(p.crawlDepth)
            const k = d >= 5 ? '5+' : String(d)
            if (depthBins[k] != null) depthBins[k]++

            // template / category
            const tmpl = String(p.pageCategory || p.contentType || 'page').toLowerCase().split('/')[0] || 'page'
            templateBins[tmpl] = (templateBins[tmpl] ?? 0) + 1

            // ttfb / render
            if (Number.isFinite(p.ttfb) || Number.isFinite(p.loadTime)) {
                ttfb.push(safe(p.ttfb || p.loadTime))
            }
            const rm = String(p.renderMode || '').toLowerCase()
            if (rm === 'ssr') renderMix.ssr++
            else if (rm === 'csr') renderMix.csr++
            else renderMix.static++

            // page-level Q score (if present)
            const q = safe(p.contentQualityScore || p.techHealthScore || p.opportunityScore)
            if (q > 0) {
                scoreSum += q; scoreN++
                if (q < 20) scoreBuckets['0-20']++
                else if (q < 40) scoreBuckets['20-40']++
                else if (q < 60) scoreBuckets['40-60']++
                else if (q < 80) scoreBuckets['60-80']++
                else scoreBuckets['80-100']++
            }
            if (typeof p.scoreDelta === 'number') {
                if (p.scoreDelta > 0) moversUp++
                else if (p.scoreDelta < 0) moversDown++
            }

            // issue rollup (only for cheap fields; the heavy taxonomy is ran in row UI)
            if (Array.isArray(p._issues)) {
                for (const iss of p._issues) {
                    const cat = (iss.category || iss.tier || 'Other')
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1
                    issueLabelCount[iss.label] = (issueLabelCount[iss.label] || 0) + 1
                    const t = (iss.severity || iss.type || '').toLowerCase()
                    if (t === 'critical' || t === 'error') critical++
                    else if (t === 'high' || t === 'warning') high++
                    else if (t === 'medium') medium++
                    else if (t === 'low') low++
                    else if (t === 'notice' || t === 'info') notice++
                }
            }
        }

        const ttfbSorted = ttfb.slice().sort((a, b) => a - b)
        const pct = (arr: number[], q: number) => {
            if (arr.length === 0) return 0
            const i = Math.min(arr.length - 1, Math.floor(q * arr.length))
            return Math.round(arr[i])
        }

        const statusMix: FullAuditRsData['statusMix'] = (['2xx', '3xx', '4xx', '5xx', 'other'] as StatusBucket[])
            .map(bk => ({ bucket: bk, value: statusCounts[bk] }))
            .filter(x => x.value > 0)

        const depth: FullAuditRsData['depth'] = Object.entries(depthBins)
            .map(([label, value]) => ({ label, value }))

        const template: FullAuditRsData['template'] = Object.entries(templateBins)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value]) => ({ label, value }))

        const byCategory = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value]) => ({ label, value }))

        const topIssues = Object.entries(issueLabelCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value]) => ({ label, value }))

        const overall = safe(healthScore?.score)
        const components: FullAuditRsData['scores']['components'] = [
            { label: 'Content',  value: averageOver(list, 'contentQualityScore'),    tone: 'warn' },
            { label: 'Tech',     value: averageOver(list, 'techHealthScore'),        tone: 'good' },
            { label: 'Schema',   value: averageOver(list, 'schemaScore'),            tone: 'warn' },
            { label: 'Links',    value: averageOver(list, 'authorityScore'),         tone: 'warn' },
            { label: 'A11y',     value: averageOver(list, 'a11yScore'),              tone: 'good' },
            { label: 'Security', value: averageOver(list, 'securityScore'),          tone: 'good' },
        ].filter(c => c.value > 0)

        const integrationStatus = (k: 'google' | 'bing' | 'gbp' | 'backlinks' | 'keywords' | 'ga4'): FullAuditRsData['integrations']['gsc'] => {
            const v = (integrationConnections as any)?.[k]?.status
            if (v === 'connected') return 'connected'
            if (v === 'error') return 'error'
            return 'disconnected'
        }
        const cov = (key: string) => {
            const n = list.filter(p => Number.isFinite(p?.[key])).length
            return { count: n, pct: total === 0 ? 0 : Math.round((n / total) * 100) }
        }

        return {
            counts: { total, indexable, nonIndexable, inSitemap, notInSitemap, orphans, broken, redirects, serverErrors, blocked, canonicalIssues },
            statusMix,
            depth,
            template,
            issues: {
                critical, high, medium, low, notice,
                byCategory,
                topIssues,
                new: 0,        // wire to session-diff store later
                resolved: 0,
            },
            scores: {
                overall,
                components,
                distribution: Object.entries(scoreBuckets).map(([label, value]) => ({ label, value })),
                movers: { up: moversUp, down: moversDown },
            },
            crawl: {
                lastRunAt: crawlRuntime?.finishedAt || crawlRuntime?.startedAt || null,
                durationMs: crawlRuntime?.durationMs || null,
                pages: total,
                budget: safe(crawlRuntime?.discovered) || total,
                avgMs: ttfb.length ? Math.round(ttfb.reduce((a, b) => a + b, 0) / ttfb.length) : 0,
                p90Ms: pct(ttfbSorted, 0.9),
                p99Ms: pct(ttfbSorted, 0.99),
                errors: errCounts,
                blocked: blkCounts,
                sitemapParity: {
                    matched: inSitemap,
                    crawlOnly: Math.max(0, total - inSitemap),
                    sitemapOnly: Math.max(0, notInSitemap),
                },
                renderMix,
            },
            integrations: {
                gsc:        integrationStatus('google'),
                ga4:        integrationStatus('ga4'),
                bing:       integrationStatus('bing'),
                gbp:        integrationStatus('gbp'),
                backlinks:  integrationStatus('backlinks'),
                keywords:   integrationStatus('keywords'),
                coverage: {
                    gsc:    cov('gscClicks').count,
                    gscPct: cov('gscClicks').pct,
                    kw:     cov('mainKeyword').count,
                    kwPct:  cov('mainKeyword').pct,
                    bl:     cov('backlinks').count,
                    blPct:  cov('backlinks').pct,
                },
                freshness: {
                    gsc:        (integrationConnections as any)?.google?.lastSyncAt ?? null,
                    ga4:        (integrationConnections as any)?.ga4?.lastSyncAt ?? null,
                    backlinks:  (integrationConnections as any)?.backlinks?.lastSyncAt ?? null,
                },
            },
        }
    }, [pages, healthScore, integrationConnections, crawlRuntime])
}

function averageOver(list: any[], key: string): number {
    let s = 0, n = 0
    for (const p of list) {
        const v = Number(p?.[key])
        if (Number.isFinite(v) && v > 0) { s += v; n++ }
    }
    return n === 0 ? 0 : Math.round(s / n)
}
