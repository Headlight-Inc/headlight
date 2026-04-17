import React, { useMemo } from 'react';
import type { WqaSiteStats } from '../../../../services/WebsiteQualityModeTypes';
import type { DetectedIndustry } from '../../../../services/SiteTypeDetector';
import PositionHistogram from '../charts/PositionHistogram';
import ScatterPlot from '../charts/ScatterPlot';
import HeatmapGrid from '../charts/HeatmapGrid';
import { formatCat, formatCompact } from '../wqaUtils';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSearchStats } from '../../../../services/WqaSidebarData';

interface Props {
    pages: any[];
    filteredPages: any[];
    stats: WqaSiteStats | null;
    industry: DetectedIndustry;
}

export default function WQASearchTab({ pages, stats }: Props) {
    const { setWqaFilter } = useSeoCrawler();

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-[#555] h-[300px]">
                <div className="text-center">
                    <div className="mb-4 text-3xl opacity-40">🔍</div>
                    <h3 className="text-[13px] font-bold text-[#888] mb-1">No Search Insights</h3>
                    <p className="text-[11px] text-[#555] max-w-[200px] mx-auto">
                        Connect Google Search Console to see keyword visibility and striking distance analysis.
                    </p>
                </div>
            </div>
        );
    }

    const htmlPages = useMemo(
        () => pages.filter((p) => p.isHtmlPage && p.statusCode === 200),
        [pages]
    );

    const searchStats = useMemo(() => computeWqaSearchStats(pages), [pages]);

    const positionBuckets = useMemo(() => {
        const { positionBands } = searchStats;
        return [
            { label: '1–3',   count: positionBands.top3 },
            { label: '4–10',  count: positionBands.page1 },
            { label: '11–20', count: positionBands.striking },
            { label: '21–50', count: positionBands.weak },
            { label: '50+',   count: positionBands.none }, // This mapping might be loose but aligns with the new schema
        ];
    }, [searchStats]);

    const scatterData = useMemo(() =>
        htmlPages
            .filter((p) => Number(p.gscPosition || 0) > 0 && Number(p.gscImpressions || 0) > 0)
            .map((p) => ({
                x:     Number(p.gscPosition),
                y:     Number(p.gscCtr || 0) * 100,
                size:  Math.max(3, Math.min(20, Math.sqrt(Number(p.gscImpressions || 0)) / 5)),
                color: Number(p.ctrGap || 0) < -0.02 ? '#ef4444' : Number(p.ctrGap || 0) > 0.01 ? '#3b82f6' : '#555',
                label: p.pagePath || p.url,
            }))
            .slice(0, 200),
    [htmlPages]);

    const topKeywords = useMemo(() =>
        htmlPages
            .filter((p) => p.mainKeyword && Number(p.gscImpressions || 0) > 0)
            .sort((a, b) => Number(b.gscImpressions) - Number(a.gscImpressions))
            .slice(0, 10)
            .map((p) => ({
                keyword:     p.mainKeyword,
                position:    Math.round(Number(p.gscPosition || 0)),
                impressions: Number(p.gscImpressions || 0),
                ctr:         Number(p.gscCtr || 0),
                ctrGap:      Number(p.ctrGap || 0),
            })),
    [htmlPages]);

    const trafficMovers = useMemo(() => {
        const withDelta = htmlPages.filter((p) => p.sessionsDeltaPct != null && Number(p.ga4Sessions || 0) > 0);
        const gaining = [...withDelta]
            .filter((p) => Number(p.sessionsDeltaPct) > 0.1)
            .sort((a, b) => Number(b.sessionsDeltaPct) - Number(a.sessionsDeltaPct))
            .slice(0, 5)
            .map((p) => ({ path: p.pagePath || p.url, pct: Number(p.sessionsDeltaPct) * 100 }));
        const losing = [...withDelta]
            .filter((p) => p.isLosingTraffic === true)
            .sort((a, b) => Number(a.sessionsDeltaPct) - Number(b.sessionsDeltaPct))
            .slice(0, 5)
            .map((p) => ({ path: p.pagePath || p.url, pct: Number(p.sessionsDeltaPct) * 100 }));
        return { gaining, losing };
    }, [htmlPages]);

    const strikingPages = useMemo(() =>
        htmlPages
            .filter((p) => {
                const pos = Number(p.gscPosition || 0);
                return pos >= 4 && pos <= 20 && Number(p.gscImpressions || 0) > 100;
            })
            .sort((a, b) => Number(b.gscImpressions) - Number(a.gscImpressions))
            .slice(0, 5),
    [htmlPages]);

    const strikingEstImpact = useMemo(() => {
        return strikingPages.reduce((sum, p) => {
            const impr = Number(p.gscImpressions || 0);
            const pos  = Number(p.gscPosition || 0);
            const ctr  = Number(p.gscCtr || 0);
            const newCtr = pos <= 10 ? 0.028 : 0.08;
            return sum + Math.max(0, Math.round(impr * (newCtr - ctr)));
        }, 0);
    }, [strikingPages]);

    const cannibalized = useMemo(() => {
        const kwMap = new Map<string, string[]>();
        htmlPages.forEach((p) => {
            if (p.mainKeyword && p.isCannibalized) {
                const kw = String(p.mainKeyword).toLowerCase().trim();
                if (!kwMap.has(kw)) kwMap.set(kw, []);
                kwMap.get(kw)!.push(p.pagePath || p.url);
            }
        });
        return Array.from(kwMap.entries())
            .filter(([, urls]) => urls.length > 1)
            .slice(0, 5)
            .map(([keyword, urls]) => ({ keyword, urls }));
    }, [htmlPages]);

    const intentStats = useMemo(() => {
        let aligned = 0, misaligned = 0, noKw = 0;
        htmlPages.forEach((p) => {
            if (!p.mainKeyword)                    noKw      += 1;
            else if (p.intentMatch === 'aligned')   aligned   += 1;
            else if (p.intentMatch === 'misaligned')misaligned += 1;
            else                                    noKw      += 1;
        });
        const total = aligned + misaligned + noKw;
        return { aligned, misaligned, noKw, total };
    }, [htmlPages]);

    const heatmapData = useMemo(() => {
        const categories = ['product', 'blog_post', 'category', 'landing_page', 'service_page'];
        const cells = categories.map((cat) => {
            const catPages = htmlPages.filter((p) => p.pageCategory === cat);
            if (catPages.length === 0) return null;
            const growing   = catPages.filter((p) => Number(p.sessionsDeltaPct || 0) > 0.15).length;
            const declining = catPages.filter((p) => p.isLosingTraffic).length;
            const total     = catPages.length;
            const status: 'growing' | 'flat' | 'declining' =
                declining / total > 0.3 ? 'declining' :
                growing   / total > 0.3 ? 'growing'   : 'flat';
            return { row: formatCat(cat), col: 'Now', status, growing, declining, total };
        }).filter(Boolean) as Array<{ row: string; col: string; status: 'growing' | 'flat' | 'declining'; growing: number; declining: number; total: number }>;

        return {
            cells,
            rows: cells.map((c) => c.row),
            cols: ['Now'],
        };
    }, [htmlPages]);

    const showHeatmap    = heatmapData.cells.length > 0;
    const showScatter    = scatterData.length > 0;
    const showMovers     = trafficMovers.gaining.length > 0 || trafficMovers.losing.length > 0;
    const showStriking   = strikingPages.length > 0;
    const showCannibal   = cannibalized.length > 0;
    const avgCtrDisplay  = stats.avgCtr > 0 ? `${stats.avgCtr.toFixed(1)}%` : '—';
    const avgPosDisplay  = stats.avgPosition > 0 ? stats.avgPosition.toFixed(1) : '—';

    return (
        <div className="p-3 space-y-4">

            {/* Summary stats */}
            <section>
                <SectionHeader title="Search Visibility" />
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <MiniStat label="Impressions" value={formatCompact(stats.totalImpressions)} />
                    <MiniStat label="Clicks"      value={formatCompact(stats.totalClicks)} />
                    <MiniStat label="Avg Position"value={avgPosDisplay} />
                    <MiniStat label="Avg CTR"     value={avgCtrDisplay} />
                    <MiniStat label="Sessions"    value={formatCompact(stats.totalSessions)} />
                    <MiniStat label="Losing"      value={searchStats.declining > 0 ? String(searchStats.declining) : '—'} warn={searchStats.declining > 0} />
                </div>
            </section>

            {/* Position distribution */}
            <section>
                <SectionHeader title="Position Distribution" />
                <PositionHistogram data={positionBuckets} />
            </section>

            {/* Striking distance */}
            {showStriking && (
                <section>
                    <SectionHeader title="Striking Distance" />
                    <div className="bg-[#0f1a24] border border-[#1a2d40] rounded-lg p-3 mb-2">
                        <div className="text-[11px] text-[#ccc] mb-1">
                            <span className="text-blue-400 font-bold">{searchStats.positionBands.striking}</span> pages at pos 4–20 with 100+ impressions
                        </div>
                        {strikingEstImpact > 0 && (
                            <div className="text-[10px] text-[#888]">
                                Est. +<span className="text-green-400 font-mono">{formatCompact(strikingEstImpact)}</span> clicks if they reach top 3
                            </div>
                        )}
                        <button
                            onClick={() => setWqaFilter((prev) => ({ ...prev, searchStatus: 'striking' }))}
                            className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Filter to these pages →
                        </button>
                    </div>
                    <div className="space-y-1">
                        {strikingPages.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => setWqaFilter(prev => ({ ...prev, searchQuery: p.url }))}
                                className="w-full flex items-center justify-between p-2.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] rounded transition-colors group"
                            >
                                <span className="text-[11px] text-[#ccc] group-hover:text-white truncate max-w-[160px]">{p.pagePath || p.url}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-[#555] font-mono bg-black/40 px-1.5 py-0.5 rounded">pos {Math.round(Number(p.gscPosition))}</span>
                                    <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{formatCompact(Number(p.gscImpressions))} impr</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* CTR scatter */}
            {showScatter && (
                <section>
                    <SectionHeader title="CTR vs Position" />
                    <ScatterPlot data={scatterData} xLabel="Position" yLabel="CTR %" height={180} />
                    <div className="flex gap-3 mt-1 text-[9px] text-[#555]">
                        <span><span className="text-red-400">●</span> Below expected</span>
                        <span><span className="text-blue-400">●</span> Above expected</span>
                        <span><span className="text-[#555]">●</span> Normal</span>
                    </div>
                </section>
            )}

            {/* Traffic movers */}
            {showMovers && (
                <section>
                    <SectionHeader title="Traffic Movement" />
                    {trafficMovers.gaining.length > 0 && (
                        <div className="mb-3">
                            <div className="text-[9px] text-green-400 uppercase tracking-widest mb-1.5 font-bold">Gaining</div>
                            <div className="space-y-1">
                                {trafficMovers.gaining.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-[#141414]/50 border border-[#222] rounded text-[10px]">
                                        <span className="text-[#ccc] truncate max-w-[180px]">{m.path}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-mono text-[9px] shrink-0">▲ {m.pct.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {trafficMovers.losing.length > 0 && (
                        <div>
                            <div className="text-[9px] text-red-400 uppercase tracking-widest mb-1.5 font-bold">Losing</div>
                            <div className="space-y-1">
                                {trafficMovers.losing.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-[#141414]/50 border border-[#222] rounded text-[10px]">
                                        <span className="text-[#ccc] truncate max-w-[180px]">{m.path}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[#F5364E] font-mono text-[9px] shrink-0">▼ {Math.abs(m.pct).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Traffic by category heatmap */}
            {showHeatmap && (
                <section>
                    <SectionHeader title="Traffic by Category" />
                    <HeatmapGrid data={heatmapData.cells} rows={heatmapData.rows} cols={heatmapData.cols} />
                    <div className="space-y-1 mt-2">
                        {heatmapData.cells.map((row) => (
                            <div key={row.row} className="flex items-center justify-between text-[10px]">
                                <span className="text-[#888] w-28 truncate">{row.row}</span>
                                <span className="text-[#555] text-[9px]">{row.growing}↑ {row.declining}↓ / {row.total}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Top keywords */}
            {topKeywords.length > 0 && (
                <section>
                    <SectionHeader title="Top Keywords" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-[#151515]">
                                    <th className="text-left   text-[#555] font-normal pb-1">Keyword</th>
                                    <th className="text-right  text-[#555] font-normal pb-1 w-10">Pos</th>
                                    <th className="text-right  text-[#555] font-normal pb-1 w-14">Impr</th>
                                    <th className="text-right  text-[#555] font-normal pb-1 w-12">CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topKeywords.map((kw, i) => (
                                    <tr key={i} className="border-b border-[#0e0e0e] hover:bg-[#111]">
                                        <td className="text-[#ccc] py-1.5 truncate max-w-[150px]">{kw.keyword}</td>
                                        <td className="text-right text-[#888] py-1.5">{kw.position}</td>
                                        <td className="text-right text-[#888] py-1.5">{formatCompact(kw.impressions)}</td>
                                        <td className={`text-right py-1.5 font-mono ${kw.ctrGap < -0.02 ? 'text-red-400' : 'text-[#888]'}`}>
                                            {(kw.ctr * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Cannibalization */}
            {showCannibal && (
                <section>
                    <SectionHeader title="Cannibalized Keywords" />
                    <div className="space-y-2">
                        {cannibalized.map((c, i) => (
                            <div key={i} className="bg-[#111] border border-[#1a1a1a] rounded p-2">
                                <div className="text-[11px] text-orange-400 font-medium">"{c.keyword}"</div>
                                <div className="text-[9px] text-[#555] mt-1 space-y-0.5">
                                    {c.urls.map((u, j) => <div key={j} className="truncate">{u}</div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Intent alignment */}
            <section>
                <SectionHeader title="Intent Alignment" />
                <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                        <span className="text-[#888]">Aligned</span>
                        <span className="text-green-400 font-mono">
                            {intentStats.aligned}
                            {intentStats.total > 0 && <span className="text-[#555]"> ({Math.round((intentStats.aligned / intentStats.total) * 100)}%)</span>}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#888]">Misaligned</span>
                        <span className="text-red-400 font-mono">
                            {intentStats.misaligned}
                            {intentStats.total > 0 && <span className="text-[#555]"> ({Math.round((intentStats.misaligned / intentStats.total) * 100)}%)</span>}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#888]">No keyword</span>
                        <span className="text-[#555] font-mono">{intentStats.noKw}</span>
                    </div>
                </div>
            </section>

        </div>
    );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
    return (
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#888] border-b border-[#222] pb-1 mb-3">
            {title}
        </h4>
    );
}

function MiniStat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
    return (
        <div className="bg-[#141414] border border-[#222] rounded p-2 text-center">
            <div className={`text-[13px] font-bold font-mono ${warn ? 'text-[#F5364E]' : 'text-white'}`}>{value}</div>
            <div className="text-[9px] text-[#555] uppercase tracking-wider mt-0.5">{label}</div>
        </div>
    );
}
