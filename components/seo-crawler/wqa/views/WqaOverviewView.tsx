import React, { useMemo } from 'react';
import {
    TrendingDown, TrendingUp, AlertTriangle, Target, Zap, Layers,
    Activity, Link2, Search, FileText, Globe,
} from 'lucide-react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { formatIndustryLabel } from '../wqaUtils';
import ScoreRing   from './shared/ScoreRing';
import MetricTile  from './shared/MetricTile';
import ImpactBar   from './shared/ImpactBar';
import PagePreviewRow from './shared/PagePreviewRow';
import EmptyViewState from './shared/EmptyViewState';

import ContentQualityRadar from '../../charts/ContentQualityRadar';
import IssueCategoryTreemap from '../../charts/IssueCategoryTreemap';
import CrawlDepthFunnel from '../../charts/CrawlDepthFunnel';
import SunburstChart from '../charts/SunburstChart';
import StackedBar    from '../charts/StackedBar';
import TrendLine     from '../charts/TrendLine';

const VALUE_COLORS: Record<string, string> = {
    '★★★': '#22c55e', '★★': '#3b82f6', '★': '#eab308', '☆': '#6b7280',
};

export default function WqaOverviewView() {
    const {
        wqaState, wqaFacets, wqaForecast, filteredWqaPagesExport,
        setWqaFilter, wqaFilter, applyWqaQuickFilter,
    } = useSeoCrawler();

    const stats = wqaState.siteStats;

    const radar = useMemo(() => {
        if (!stats) return [];
        return [
            { metric: 'Content',   value: stats.radarContent || 0 },
            { metric: 'SEO',       value: stats.radarSeo || 0 },
            { metric: 'Authority', value: stats.radarAuthority || 0 },
            { metric: 'UX',        value: stats.radarUx || 0 },
            { metric: 'Search',    value: stats.radarSearchPerf || 0 },
            { metric: 'Trust',     value: stats.radarTrust || 0 },
        ];
    }, [stats]);

    const valueTierData = useMemo(() => {
        if (!stats) return [];
        return [
            { label: '★★★ Top',    value: stats.highValuePages || 0,   color: VALUE_COLORS['★★★'] },
            { label: '★★ High',    value: stats.mediumValuePages || 0, color: VALUE_COLORS['★★'] },
            { label: '★ Medium',   value: stats.lowValuePages || 0,    color: VALUE_COLORS['★'] },
            { label: '☆ Low/none', value: stats.zeroValuePages || 0,   color: VALUE_COLORS['☆'] },
        ];
    }, [stats]);

    const categoryData = useMemo(() => {
        if (!stats?.pagesByCategory) return [];
        const palette = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#f97316'];
        return Object.entries(stats.pagesByCategory)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 7)
            .map(([k, v], i) => ({ label: k, value: v as number, color: palette[i % palette.length] }));
    }, [stats]);

    const topOpportunities = useMemo(() => {
        return [...filteredWqaPagesExport]
            .filter((p) => (p.opportunityScore || 0) > 0)
            .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
            .slice(0, 8);
    }, [filteredWqaPagesExport]);

    const topLosing = useMemo(() => {
        return [...filteredWqaPagesExport]
            .filter((p) => Number(p.sessionsDeltaPct || 0) < 0)
            .sort((a, b) => Number(a.sessionsDeltaPct || 0) - Number(b.sessionsDeltaPct || 0))
            .slice(0, 5);
    }, [filteredWqaPagesExport]);

    if (!stats) {
        return <EmptyViewState
            title="Run a crawl to see your overview"
            subtitle="Overview summarizes the whole site: score, distribution, top actions, losing pages, forecast."
        />;
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#070707] p-5 space-y-5">

            {/* Row 1: Score + context */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-4 bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-5">
                    <ScoreRing score={wqaState.siteScore} grade={wqaState.siteGrade} delta={wqaState.scoreDelta} />
                    <div className="flex-1 space-y-1.5 text-[11px]">
                        <div><span className="text-[#666]">Industry</span> <span className="text-white ml-2">{formatIndustryLabel(wqaState.detectedIndustry)}</span></div>
                        <div><span className="text-[#666]">Language</span> <span className="text-white ml-2">{wqaState.detectedLanguage || '—'}</span></div>
                        <div><span className="text-[#666]">CMS</span>      <span className="text-white ml-2">{wqaState.detectedCms || 'Unknown'}</span></div>
                        <div><span className="text-[#666]">Pages</span>    <span className="text-white ml-2">{stats.totalPages.toLocaleString()} ({stats.htmlPages.toLocaleString()} HTML)</span></div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 grid grid-cols-4 gap-3">
                    <MetricTile label="Impressions 30d" value={stats.totalImpressions.toLocaleString()} sub={`Clicks ${stats.totalClicks.toLocaleString()} · CTR ${(stats.avgCtr).toFixed(2)}%`} icon={<Search size={11}/>} />
                    <MetricTile label="Sessions 30d"    value={stats.totalSessions.toLocaleString()}    sub={`Avg pos ${stats.avgPosition.toFixed(1)}`} icon={<Activity size={11}/>} />
                    <MetricTile label="Losing Traffic"  value={stats.pagesLosingTraffic.toLocaleString()} sub="pages declining vs prev period" tone={stats.pagesLosingTraffic > 0 ? 'warn' : 'good'} icon={<TrendingDown size={11}/>} onClick={() => applyWqaQuickFilter('losing_traffic')} />
                    <MetricTile label="Striking Distance" value={stats.pagesInStrikingDistance.toLocaleString()} sub="pos 4–20, impressions > 100" tone="info" icon={<Target size={11}/>} onClick={() => applyWqaQuickFilter('striking_distance')} />
                    <MetricTile label="Zero Impressions" value={stats.pagesWithZeroImpressions.toLocaleString()} sub="indexable HTML, no GSC impr" tone="warn" icon={<AlertTriangle size={11}/>} onClick={() => applyWqaQuickFilter('no_search_traffic')} />
                    <MetricTile label="Orphans w/ value" value={stats.orphanPagesWithValue.toLocaleString()} sub="0 inlinks + real traffic"     tone="bad"  icon={<Link2 size={11}/>} onClick={() => applyWqaQuickFilter('orphans')} />
                    <MetricTile label="Cannibalization" value={stats.cannibalizationCount.toLocaleString()} sub="overlapping queries"           tone="warn" icon={<Layers size={11}/>} />
                    <MetricTile label="Decay Risk"      value={stats.decayRiskCount.toLocaleString()}      sub="stale + declining"              tone="warn" icon={<Zap size={11}/>} onClick={() => applyWqaQuickFilter('stale')} />
                </div>
            </div>

            {/* Row 2: Forecast + Top actions */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-5 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <TrendingUp size={12} /> Forecast · If top 20 actions ship
                    </div>
                    {wqaForecast ? (
                        <>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <div>
                                    <div className="text-[10px] text-[#666]">Projected clicks</div>
                                    <div className="text-[18px] font-black text-green-400">+{Number(wqaForecast.projectedClickLift || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-[#666]">Projected score</div>
                                    <div className="text-[18px] font-black text-blue-400">{Math.round(Number(wqaForecast.projectedScore || wqaState.siteScore))}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-[#666]">Effort</div>
                                    <div className="text-[18px] font-black text-white">{wqaForecast.effortLabel || '—'}</div>
                                </div>
                            </div>
                            <TrendLine data={wqaForecast.trajectory || []} color="#22c55e" height={120} />
                        </>
                    ) : (
                        <div className="text-[11px] text-[#666]">Run enrichment to generate a forecast.</div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-7 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3">Top actions by estimated impact</div>
                    <div className="space-y-2">
                        {wqaState.actionGroups.slice(0, 6).map((g) => (
                            <button
                                key={`${g.category}:${g.action}`}
                                onClick={() => setWqaFilter({
                                    ...wqaFilter,
                                    ...(g.category === 'technical' ? { technicalAction: g.action } : {}),
                                    ...(g.category === 'content'   ? { contentAction: g.action }   : {}),
                                })}
                                className="w-full text-left grid grid-cols-[100px_1fr_60px_80px] gap-3 items-center px-3 py-2 rounded hover:bg-[#111] border border-transparent hover:border-[#333] transition-colors"
                            >
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                                    g.category === 'technical' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                                    g.category === 'content'   ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                                                                 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                }`}>{g.category}</span>
                                <span className="text-[12px] text-white truncate">{g.action}</span>
                                <span className="text-[11px] font-mono text-[#aaa] text-right">{g.count}</span>
                                <ImpactBar value={g.impact} max={Math.max(1, ...wqaState.actionGroups.map(x => x.impact))} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Health radar + Page category sunburst + Value tiers */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-5">
                    <ContentQualityRadar data={radar} />
                </div>
                <div className="col-span-12 lg:col-span-4 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3">Page categories</div>
                    <div className="flex items-center gap-4">
                        <SunburstChart data={categoryData} size={180} />
                        <div className="flex-1 space-y-1">
                            {categoryData.map((c) => (
                                <div key={c.label} className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#ccc] flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                                        {c.label}
                                    </span>
                                    <span className="font-mono text-[#888]">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-3 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3">Value distribution</div>
                    <StackedBar data={valueTierData} />
                </div>
            </div>

            {/* Row 4: Issue treemap + Depth funnel */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7">
                    <IssueCategoryTreemap data={useMemo(() => {
                        const counts: Record<string, number> = {};
                        filteredWqaPagesExport.forEach(p => {
                            (p.issueCategories || []).forEach((c: string) => {
                                counts[c] = (counts[c] || 0) + 1;
                            });
                        });
                        return Object.entries(counts).map(([name, size]) => ({ name, size }));
                    }, [filteredWqaPagesExport])} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                    <CrawlDepthFunnel data={useMemo(() => {
                        const buckets: Record<string, number> = {};
                        filteredWqaPagesExport.forEach((p) => {
                            const d = Number(p.crawlDepth ?? 0);
                            const key = d >= 6 ? '6+' : String(d);
                            buckets[key] = (buckets[key] || 0) + 1;
                        });
                        return ['0','1','2','3','4','5','6+'].map((k) => ({ depth: `Depth ${k}`, count: buckets[k] || 0 }));
                    }, [filteredWqaPagesExport])} />
                </div>
            </div>

            {/* Row 5: Top opportunities + Losing */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Target size={12} /> Top 8 opportunities
                    </div>
                    <div className="space-y-1.5">
                        {topOpportunities.map((p) => <PagePreviewRow key={p.url} page={p} />)}
                        {topOpportunities.length === 0 && <div className="text-[11px] text-[#666]">No scored opportunities yet. Run enrichment.</div>}
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-5 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <div className="text-[11px] text-[#666] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <TrendingDown size={12} /> Losing traffic
                    </div>
                    <div className="space-y-1.5">
                        {topLosing.map((p) => <PagePreviewRow key={p.url} page={p} />)}
                        {topLosing.length === 0 && <div className="text-[11px] text-[#666]">No declining pages detected.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
