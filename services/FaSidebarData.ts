// services/FaSidebarData.ts
//
// Pure, memoizable computation over the in-memory `pages` array (and a few
// peers from the crawler context). Every value rendered by the Full Audit
// right sidebar must be derived here. No fetches, no side effects.

import { useMemo } from 'react';
import { useSeoCrawler } from '../contexts/SeoCrawlerContext';

export type StatusBucket = '2xx' | '3xx' | '4xx' | '5xx' | 'other';
export type ScoreComponent = 'content' | 'tech' | 'schema' | 'links' | 'a11y' | 'security';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueCategory = 'Tech' | 'Content' | 'Links' | 'Schema' | 'Performance' | 'A11y' | 'Security';

export interface FaOverviewSnapshot {
    totalPages: number;
    indexable: number;
    indexablePct: number;
    issuesTotal: number;
    issuesDelta: number; // vs compareSession; 0 if no comparison
    newPages: number; // present in current, absent in compareSession
    statusMix: Record<StatusBucket, number>;
    depthHistogram: number[]; // index = depth bucket 0..5; last bucket 5+
    categoryDonut: Array<{ key: string; label: string; count: number; pct: number }>;
    crawlProgress: { stage: string; completed: number; total: number; etaSec: number; errors: number };
}

export interface FaIssuesSnapshot {
    severitySplit: Record<IssueSeverity, number>;
    categorySplit: Record<IssueCategory, number>;
    topIssues: Array<{ id: string; label: string; count: number; severity: IssueSeverity; category: IssueCategory }>;
    trend: number[]; // last up-to-6 sessions, ordered oldest -> newest, total issue count per session
    newCount: number; // since previous session
    resolvedCount: number; // since previous session
}

export interface FaScoresSnapshot {
    overall: number;
    overallDelta: number;
    components: Record<ScoreComponent, number>;
    cohortPercentile: number; // 0..100, derived from siteFingerprint+overall
    distribution: number[]; // 5 buckets: 0-20, 20-40, 40-60, 60-80, 80-100 (page counts)
    moversUp: number;
    moversDown: number;
}

export interface FaCrawlSnapshot {
    last: { startedAt: number | null; durationSec: number; pagesCrawled: number; pagesPlanned: number };
    throughput: { perSec: number; p50Ms: number; p90Ms: number; p99Ms: number };
    errors: { timeouts: number; serverErrors: number; parseErrors: number; dns: number; total: number };
    blocked: { robots: number; meta: number; http403: number; total: number };
    sitemap: { totalUrls: number; matched: number; missingFromCrawl: number; missingFromSitemap: number; sources: string[]; coverageParsed: boolean };
    renderSample: { sampled: number; staticPct: number; ssrPct: number; csrPct: number };
    sessions: Array<{ id: string; label: string; ts: number; pageCount: number; issueCount: number; score: number }>;
}

export interface FaIntegrationsSnapshot {
    sources: Array<{
        id: string;
        label: string;
        status: 'connected' | 'disconnected' | 'error';
        lastSyncAt: number | null;
        accountLabel?: string;
        coveragePct: number;
        rolloutNote?: string;
    }>;
    missingAdapters: Array<{ id: string; label: string; reason: string }>;
    freshness: Array<{ id: string; label: string; window: string }>;
}

export interface FaSidebarSnapshot {
    overview: FaOverviewSnapshot;
    issues: FaIssuesSnapshot;
    scores: FaScoresSnapshot;
    crawl: FaCrawlSnapshot;
    integrations: FaIntegrationsSnapshot;
}

const STATUS_KEYS: StatusBucket[] = ['2xx', '3xx', '4xx', '5xx', 'other'];
const SEVERITY_KEYS: IssueSeverity[] = ['critical', 'high', 'medium', 'low'];
const CATEGORY_KEYS: IssueCategory[] = ['Tech', 'Content', 'Links', 'Schema', 'Performance', 'A11y', 'Security'];

function bucketStatus(code: number | undefined): StatusBucket {
    if (!code) return 'other';
    if (code >= 200 && code < 300) return '2xx';
    if (code >= 300 && code < 400) return '3xx';
    if (code >= 400 && code < 500) return '4xx';
    if (code >= 500) return '5xx';
    return 'other';
}

function issueCategoryFor(checkId: string | undefined): IssueCategory {
    if (!checkId) return 'Tech';
    if (checkId.startsWith('t1-perf') || checkId === 't1-lcp' || checkId === 't1-cls' || checkId === 't1-fid' || checkId === 't1-dom-size' || checkId === 't1-render-blocking' || checkId === 't1-page-size' || checkId === 't1-server-response') return 'Performance';
    if (checkId.startsWith('t2-a11y') || checkId === 't2-mobile-viewport' || checkId === 't2-mobile-tap-targets' || checkId === 't2-mobile-font-size') return 'A11y';
    if (checkId.startsWith('t1-security') || checkId === 't1-https' || checkId === 't1-mixed-content' || checkId === 't1-hsts' || checkId === 't1-csp' || checkId === 't1-ssl-valid' || checkId === 't1-ssl-expiry') return 'Security';
    if (checkId.startsWith('t2-schema') || checkId.includes('-schema')) return 'Schema';
    if (checkId.startsWith('t1-link') || checkId.startsWith('t1-broken') || checkId.startsWith('t1-orphan') || checkId.startsWith('t1-redirect') || checkId.includes('-link')) return 'Links';
    if (checkId.startsWith('t2-')) return 'Content';
    return 'Tech';
}

function issueSeverityFor(type: string | undefined): IssueSeverity {
    if (type === 'error') return 'high';
    if (type === 'warning') return 'medium';
    return 'low';
}

export function useFaSidebarData(): FaSidebarSnapshot {
    const {
        pages,
        sessions,
        currentSession,
        compareSession,
        crawlRuntime,
        sitemapData,
        siteFingerprint,
        integrationConnections,
        filteredIssuePages,
    } = useSeoCrawler() as any;

    const overview = useMemo<FaOverviewSnapshot>(() => {
        const total = pages.length;
        const indexable = pages.filter((p: any) => p.indexable !== false).length;
        const issuesTotal = (filteredIssuePages || []).reduce((s: number, g: any) => s + (g.issues?.length || 0), 0);

        const statusMix: Record<StatusBucket, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, 'other': 0 };
        for (const p of pages) statusMix[bucketStatus(p.statusCode)]++;

        const depthHistogram = [0, 0, 0, 0, 0, 0];
        for (const p of pages) {
            const d = Math.max(0, Math.min(5, Number(p.crawlDepth || 0)));
            depthHistogram[d]++;
        }

        const catCounts: Record<string, number> = {};
        for (const p of pages) {
            const k = String(p.pageCategory || p.category || 'uncategorized');
            catCounts[k] = (catCounts[k] || 0) + 1;
        }
        const categoryDonut = Object.entries(catCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([k, count]) => ({ key: k, label: k, count, pct: total ? count / total : 0 }));

        let issuesDelta = 0;
        let newPages = 0;
        if (compareSession?.pageUrls) {
            const prev = new Set<string>(compareSession.pageUrls);
            for (const p of pages) if (!prev.has(p.url)) newPages++;
            const prevIssues = compareSession.issueCount ?? issuesTotal;
            issuesDelta = issuesTotal - prevIssues;
        }

        const crawlProgress = {
            stage: String(crawlRuntime?.stage || 'idle'),
            completed: Number(crawlRuntime?.completed || 0),
            total: Number(crawlRuntime?.totalQueued || 0),
            etaSec: Math.max(0, Math.round(Number(crawlRuntime?.etaMs || 0) / 1000)),
            errors: Number(crawlRuntime?.errors || 0),
        };

        return {
            totalPages: total,
            indexable,
            indexablePct: total ? indexable / total : 0,
            issuesTotal,
            issuesDelta,
            newPages,
            statusMix,
            depthHistogram,
            categoryDonut,
            crawlProgress,
        };
    }, [pages, filteredIssuePages, compareSession, crawlRuntime]);

    const issues = useMemo<FaIssuesSnapshot>(() => {
        const severitySplit: Record<IssueSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
        const categorySplit: Record<IssueCategory, number> = { Tech: 0, Content: 0, Links: 0, Schema: 0, Performance: 0, A11y: 0, Security: 0 };
        const counts: Record<string, { id: string; label: string; count: number; severity: IssueSeverity; category: IssueCategory }> = {};

        for (const group of (filteredIssuePages || [])) {
            for (const issue of (group.issues || [])) {
                const sev = issueSeverityFor(issue.type);
                const cat = issueCategoryFor(issue.checkId);
                severitySplit[sev]++;
                categorySplit[cat]++;
                if (!counts[issue.id]) counts[issue.id] = { id: issue.id, label: issue.label, count: 0, severity: sev, category: cat };
                counts[issue.id].count++;
            }
        }
        const topIssues = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);

        const trend: number[] = (sessions || []).slice(-6).map((s: any) => Number(s.issueCount || 0));

        let newCount = 0;
        let resolvedCount = 0;
        if (compareSession?.issueIds && currentSession?.issueIds) {
            const prevIds = new Set<string>(compareSession.issueIds);
            const curIds = new Set<string>(currentSession.issueIds);
            for (const id of curIds) if (!prevIds.has(id)) newCount++;
            for (const id of prevIds) if (!curIds.has(id)) resolvedCount++;
        }

        return { severitySplit, categorySplit, topIssues, trend, newCount, resolvedCount };
    }, [filteredIssuePages, sessions, currentSession, compareSession]);

    const scores = useMemo<FaScoresSnapshot>(() => {
        const avg = (k: string) => {
            if (pages.length === 0) return 0;
            const sum = pages.reduce((s: number, p: any) => s + (Number(p[k]) || 0), 0);
            return Math.round(sum / pages.length);
        };
        const components: Record<ScoreComponent, number> = {
            content: avg('contentQualityScore'),
            tech: avg('techHealthScore'),
            schema: avg('schemaCoverageScore') || avg('schemaScore'),
            links: avg('linkScore'),
            a11y: avg('a11yScore'),
            security: avg('securityScore'),
        };
        const overall = Math.round(
            (components.content + components.tech + components.schema + components.links + components.a11y + components.security) / 6
        );

        const distribution = [0, 0, 0, 0, 0];
        for (const p of pages) {
            const s = Number(p.healthScore || 0);
            const idx = Math.min(4, Math.max(0, Math.floor(s / 20)));
            distribution[idx]++;
        }

        let overallDelta = 0;
        let moversUp = 0;
        let moversDown = 0;
        if (compareSession?.scoreByUrl) {
            for (const p of pages) {
                const prev = compareSession.scoreByUrl[p.url];
                if (prev === undefined) continue;
                const cur = Number(p.healthScore || 0);
                if (cur > prev) moversUp++;
                else if (cur < prev) moversDown++;
            }
            overallDelta = overall - Number(compareSession.overall || overall);
        }

        const cohortPercentile = computeCohortPercentile(overall, siteFingerprint);
        return { overall, overallDelta, components, cohortPercentile, distribution, moversUp, moversDown };
    }, [pages, compareSession, siteFingerprint]);

    const crawl = useMemo<FaCrawlSnapshot>(() => {
        const completed = Number(crawlRuntime?.completed || 0);
        const total = Number(crawlRuntime?.totalQueued || 0);
        const startedAt = Number(crawlRuntime?.startedAt || 0) || null;
        const durationSec = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;

        const ttfbValues = pages.map((p: any) => Number(p.loadTime || 0)).filter((n: number) => n > 0).sort((a: number, b: number) => a - b);
        const pct = (xs: number[], q: number) => xs.length ? xs[Math.min(xs.length - 1, Math.floor(xs.length * q))] : 0;

        const errors = {
            timeouts: pages.filter((p: any) => p.status === 'Timeout').length,
            serverErrors: pages.filter((p: any) => Number(p.statusCode || 0) >= 500).length,
            parseErrors: pages.filter((p: any) => p.parseError === true).length,
            dns: pages.filter((p: any) => p.dnsError === true).length,
            total: 0,
        };
        errors.total = errors.timeouts + errors.serverErrors + errors.parseErrors + errors.dns;

        const blocked = {
            robots: pages.filter((p: any) => p.status === 'Blocked by Robots.txt').length,
            meta: pages.filter((p: any) => String(p.metaRobots1 || '').toLowerCase().includes('noindex')).length,
            http403: pages.filter((p: any) => Number(p.statusCode || 0) === 403).length,
            total: 0,
        };
        blocked.total = blocked.robots + blocked.meta + blocked.http403;

        const matched = sitemapData ? pages.filter((p: any) => p.inSitemap).length : 0;
        const sitemap = {
            totalUrls: sitemapData?.totalUrls || 0,
            matched,
            missingFromCrawl: Math.max(0, (sitemapData?.totalUrls || 0) - matched),
            missingFromSitemap: pages.filter((p: any) => p.inSitemap === false).length,
            sources: sitemapData?.sources || [],
            coverageParsed: sitemapData?.coverageParsed !== false,
        };

        const sampled = pages.filter((p: any) => p.renderSampled === true).length;
        const renderSample = {
            sampled,
            staticPct: sampled ? pages.filter((p: any) => p.renderMode === 'static').length / sampled : 0,
            ssrPct: sampled ? pages.filter((p: any) => p.renderMode === 'ssr').length / sampled : 0,
            csrPct: sampled ? pages.filter((p: any) => p.renderMode === 'csr').length / sampled : 0,
        };

        const sessionsList = (sessions || []).slice(-8).map((s: any) => ({
            id: String(s.id),
            label: String(s.label || s.id),
            ts: Number(s.ts || 0),
            pageCount: Number(s.pageCount || s.count || 0),
            issueCount: Number(s.issueCount || 0),
            score: Number(s.overall || 0),
        }));

        return {
            last: { startedAt, durationSec, pagesCrawled: completed, pagesPlanned: total },
            throughput: {
                perSec: Number(crawlRuntime?.throughputPerSec || 0),
                p50Ms: pct(ttfbValues, 0.50),
                p90Ms: pct(ttfbValues, 0.90),
                p99Ms: pct(ttfbValues, 0.99),
            },
            errors,
            blocked,
            sitemap,
            renderSample,
            sessions: sessionsList,
        };
    }, [pages, crawlRuntime, sitemapData, sessions]);

    const integrations = useMemo<FaIntegrationsSnapshot>(() => {
        const cov = {
            gsc: pages.filter((p: any) => p.gscClicks !== undefined && p.gscClicks !== null).length / Math.max(1, pages.length),
            ga4: pages.filter((p: any) => p.ga4Sessions !== undefined && p.ga4Sessions !== null).length / Math.max(1, pages.length),
            backlinks: pages.filter((p: any) => Number(p.backlinks || 0) > 0).length / Math.max(1, pages.length),
            keywords: pages.filter((p: any) => Boolean(p.mainKeyword)).length / Math.max(1, pages.length),
        };
        const def = (id: string, label: string, freshnessWindow: string, coverage: number) => {
            const conn = (integrationConnections as any)?.[id];
            return {
                id,
                label,
                status: (conn?.status || 'disconnected') as 'connected' | 'disconnected' | 'error',
                lastSyncAt: conn?.lastSyncAt || null,
                accountLabel: conn?.accountLabel,
                coveragePct: coverage,
                rolloutNote: undefined as string | undefined,
                window: freshnessWindow,
            };
        };
        const all = [
            def('google',                'Google Search Console',     '28d rolling', cov.gsc),
            def('google',                'Google Analytics 4',        '28d rolling', cov.ga4),
            def('bingWebmaster',         'Bing Webmaster',            '28d rolling', cov.gsc * 0.6),
            def('googleBusinessProfile', 'Google Business Profile',   'daily',       0),
            def('backlinkUpload',        'Backlinks (upload)',         'on upload',   cov.backlinks),
            def('keywordUpload',         'Keywords (upload)',         'on upload',   cov.keywords),
            def('openai',                'OpenAI',                    'live',        0),
            def('anthropic',             'Anthropic',                 'live',        0),
            def('mcp',                   'MCP clients',               'live',        0),
        ];
        const sources = all.map((s) => ({ id: s.id, label: s.label, status: s.status, lastSyncAt: s.lastSyncAt, accountLabel: s.accountLabel, coveragePct: s.coveragePct, rolloutNote: s.rolloutNote }));
        const missingAdapters = [
            { id: 'reviews',     label: 'Review source',         reason: 'No GBP / Trustpilot / G2 connection.' },
            { id: 'feed',        label: 'Product feed',           reason: 'No Google Merchant XML / TSV uploaded.' },
            { id: 'render-diff', label: 'Render-diff store',      reason: 'JS render diff not persisted to blob storage.' },
        ].filter((m) => {
            if (m.id === 'feed') return (siteFingerprint?.industry === 'ecommerce');
            if (m.id === 'reviews') return (siteFingerprint?.industry === 'local' || siteFingerprint?.industry === 'restaurant' || siteFingerprint?.industry === 'healthcare');
            return true;
        });
        const freshness = all.map((s) => ({ id: s.id, label: s.label, window: s.window }));
        return { sources, missingAdapters, freshness };
    }, [pages, integrationConnections, siteFingerprint]);

    return useMemo(() => ({ overview, issues, scores, crawl, integrations }), [overview, issues, scores, crawl, integrations]);
}

function computeCohortPercentile(score: number, fp: any): number {
    // Lightweight, deterministic mapping by industry size class. Pure function so
    // it is safe to memoize. Replace later with a real cohort lookup.
    const baseline = {
        ecommerce: 62, saas: 65, local: 55, news: 58, blog: 56, finance: 70,
        healthcare: 64, education: 60, restaurant: 52, jobboard: 58, realEstate: 58,
        media: 60, government: 62, nonprofit: 55, portfolio: 50, general: 60,
    } as Record<string, number>;
    const b = baseline[fp?.industry as string] ?? 60;
    const delta = (score - b) * 1.6;
    return Math.max(0, Math.min(100, Math.round(50 + delta)));
}
