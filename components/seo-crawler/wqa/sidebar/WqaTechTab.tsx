import React, { useMemo } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSiteStats } from '../../../../services/WqaSidebarData';
import { Bar, Card, Row, SectionTitle, StatTile, fmtInt, fmtPct, fmtScore, scoreTone } from './shared';
import StackedBar from '../charts/StackedBar';
import DepthFunnel from '../charts/DepthFunnel';

export default function WqaTechTab() {
    const { pages, wqaState, setSelectedPage } = useSeoCrawler();
    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';
    const stats = useMemo(() => computeWqaSiteStats(pages || [], industry as any), [pages, industry]);

    const speedMix = useMemo(() => {
        const buckets = { Good: 0, 'Needs work': 0, Poor: 0, Unknown: 0 };
        for (const p of (pages || [])) {
            const s = String(p.speedScore || 'Unknown');
            if (s === 'Good') buckets.Good++;
            else if (s === 'Needs Improvement' || s === 'Needs work') buckets['Needs work']++;
            else if (s === 'Poor') buckets.Poor++;
            else buckets.Unknown++;
        }
        return [
            { label: 'Good',       value: buckets.Good,          color: '#22c55e' },
            { label: 'Needs work', value: buckets['Needs work'], color: '#f59e0b' },
            { label: 'Poor',       value: buckets.Poor,          color: '#ef4444' },
            { label: 'Unknown',    value: buckets.Unknown,       color: '#444' },
        ];
    }, [pages]);

    const renderMix = useMemo(() => {
        let ssr = 0, csr = 0, hybrid = 0, unknown = 0;
        for (const p of pages || []) {
            const m = String(p.renderMode || '').toLowerCase();
            if (m === 'ssr' || m === 'static') ssr++;
            else if (m === 'csr' || m === 'spa') csr++;
            else if (m === 'hybrid' || m === 'ssg+csr') hybrid++;
            else unknown++;
        }
        return [
            { label: 'SSR/Static', value: ssr,     color: '#22c55e' },
            { label: 'Hybrid',     value: hybrid,  color: '#3b82f6' },
            { label: 'CSR',        value: csr,     color: '#f59e0b' },
            { label: 'Unknown',    value: unknown, color: '#444' },
        ];
    }, [pages]);

    const tally = useMemo(() => {
        let broken = 0, redirects = 0, nonIndexable = 0, canonMissing = 0, slow = 0;
        let httpInsecure = 0, sslIssues = 0, missingHsts = 0, canonChainGt1 = 0;
        const depthCounts: Record<number, number> = {};
        const httpHttpsMismatch: any[] = [];
        for (const p of (pages || [])) {
            const code = Number(p.statusCode || 0);
            if (code >= 400) broken++;
            else if (code >= 300) redirects++;
            if (p.indexable === false) nonIndexable++;
            if (code === 200 && !p.canonical) canonMissing++;
            if (Number(p.loadTime || 0) > 1500) slow++;
            if (String(p.url || '').startsWith('http://')) {
                httpInsecure++;
                httpHttpsMismatch.push(p);
            }
            if (p.sslValid === false)  sslIssues++;
            if (p.hstsMissing === true) missingHsts++;
            if (Number(p.canonicalChainLength || 0) > 1) canonChainGt1++;
            const d = Math.max(0, Math.min(10, Number(p.crawlDepth || 0)));
            depthCounts[d] = (depthCounts[d] || 0) + 1;
        }
        const levels = Object.entries(depthCounts)
            .map(([d, c]) => ({ depth: Number(d), count: c }))
            .sort((a, b) => a.depth - b.depth);
        return { broken, redirects, nonIndexable, canonMissing, slow, httpInsecure, sslIssues, missingHsts, canonChainGt1, levels, httpHttpsMismatch: httpHttpsMismatch.slice(0, 5) };
    }, [pages]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
                <StatTile label="Tech health"  value={fmtScore(stats.avgHealthScore)} tone={scoreTone(stats.avgHealthScore)} />
                <StatTile label="Speed score"  value={fmtScore(stats.avgSpeedScore)}  tone={scoreTone(stats.avgSpeedScore)} />
                <StatTile label="Indexability" value={fmtPct(stats.htmlPages ? (stats.indexedPages / stats.htmlPages) * 100 : 0, 1)}
                          tone={stats.indexedPages / Math.max(1, stats.htmlPages) >= 0.9 ? 'good' : 'warn'} />
                <StatTile label="Broken rate"  value={fmtPct(stats.brokenRate, 1)}    tone={stats.brokenRate > 2 ? 'bad' : 'good'} />
            </div>

            <Card>
                <SectionTitle title="Crawl health" />
                <Row label="Total crawled"    value={fmtInt(stats.totalPages)} />
                <Row label="HTML pages"       value={fmtInt(stats.htmlPages)} />
                <Row label="Indexable"        value={fmtInt(stats.indexedPages)} tone="good" />
                <Row label="Non-indexable"    value={fmtInt(tally.nonIndexable)} tone={tally.nonIndexable > 0 ? 'warn' : 'neutral'} />
                <Row label="Broken (4xx/5xx)" value={fmtInt(tally.broken)}       tone={tally.broken > 0 ? 'bad' : 'good'} />
                <Row label="Redirects"        value={fmtInt(tally.redirects)}    tone={tally.redirects > 0 ? 'warn' : 'neutral'} />
                <Row label="Missing canonical" value={fmtInt(tally.canonMissing)} tone={tally.canonMissing > 0 ? 'warn' : 'neutral'} />
                <Row label="Canonical chains > 1" value={fmtInt(tally.canonChainGt1)} tone={tally.canonChainGt1 > 0 ? 'warn' : 'good'} />
            </Card>

            {tally.levels.length > 0 && (
                <Card>
                    <SectionTitle title="Crawl depth" hint="pages per click depth" />
                    <DepthFunnel levels={tally.levels} />
                </Card>
            )}

            <Card>
                <SectionTitle title="Speed distribution" hint="site-wide" />
                <StackedBar data={speedMix} />
                <div className="mt-3"><Row label="Slow (>1.5s TTFB)" value={fmtInt(tally.slow)} tone={tally.slow > 0 ? 'warn' : 'good'} /></div>
            </Card>

            <Card>
                <SectionTitle title="Render mode" hint="JS rendering dependency" />
                <StackedBar data={renderMix} />
            </Card>

            <Card>
                <SectionTitle title="Security" />
                <Row label="HTTP pages"   value={fmtInt(tally.httpInsecure)} tone={tally.httpInsecure > 0 ? 'bad' : 'good'} />
                <Row label="SSL issues"   value={fmtInt(tally.sslIssues)}    tone={tally.sslIssues > 0 ? 'bad' : 'good'} />
                <Row label="Missing HSTS" value={fmtInt(tally.missingHsts)}  tone={tally.missingHsts > 0 ? 'warn' : 'good'} />
            </Card>

            {tally.httpHttpsMismatch.length > 0 && (
                <div>
                    <SectionTitle title="Insecure URLs" hint="still serving http://" />
                    <Card pad={false}>
                        {tally.httpHttpsMismatch.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] mt-0.5">status {p.statusCode} · {p.indexable !== false ? 'indexable' : 'non-indexable'}</div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            <Card>
                <SectionTitle title="Sitemap & coverage" />
                <Row label="Sitemap coverage" value={fmtPct(stats.sitemapCoverage, 1)}
                     tone={stats.sitemapCoverage >= 80 ? 'good' : stats.sitemapCoverage >= 50 ? 'warn' : 'bad'} />
                <div className="mt-1 mb-3"><Bar pct={stats.sitemapCoverage} tone={stats.sitemapCoverage >= 80 ? 'good' : 'warn'} /></div>
                {industry === 'news' && (
                    <>
                        <Row label="News sitemap" value={fmtPct(stats.newsSitemapCoverage, 1)}
                             hint="Required for Google News"
                             tone={stats.newsSitemapCoverage > 0 ? 'good' : 'warn'} />
                        <div className="mt-1"><Bar pct={stats.newsSitemapCoverage} tone={stats.newsSitemapCoverage > 0 ? 'good' : 'warn'} /></div>
                    </>
                )}
            </Card>
        </div>
    );
}
