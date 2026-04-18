import React, { useMemo } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSiteStats } from '../../../../services/WqaSidebarData';
import { Bar, Card, Row, SectionTitle, StatTile, fmtInt, fmtPct } from './shared';
import ScatterPlot from '../charts/ScatterPlot';
import StackedBar from '../charts/StackedBar';

export default function WqaSearchTab() {
    const { pages, wqaState, wqaFilter, setWqaFilter, setSelectedPage } = useSeoCrawler();
    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';
    const stats = useMemo(() => computeWqaSiteStats(pages || [], industry as any), [pages, industry]);

    // Position × CTR scatter
    const scatter = useMemo(() => (pages || [])
        .filter((p) => Number(p.gscImpressions || 0) > 50 && Number(p.gscPosition || 0) > 0 && Number(p.gscPosition || 0) <= 50)
        .slice(0, 200)
        .map((p) => ({ 
            x: Number(p.gscPosition), 
            y: Number(p.gscCtr || 0) * 100, 
            url: p.url,
            label: p.url,
            color: '#F5364E'
         }))
        , [pages]);

    const losers = useMemo(() => (pages || [])
        .filter((p) => p.isLosingTraffic && Number(p.gscImpressions || 0) > 100)
        .sort((a, b) => Number(a.sessionsDeltaPct || 0) - Number(b.sessionsDeltaPct || 0))
        .slice(0, 5), [pages]);

    const winners = useMemo(() => (pages || [])
        .filter((p) => Number(p.sessionsDeltaPct || 0) > 0.1 && Number(p.gscImpressions || 0) > 100)
        .sort((a, b) => Number(b.sessionsDeltaPct || 0) - Number(a.sessionsDeltaPct || 0))
        .slice(0, 5), [pages]);

    const strikers = useMemo(() => (pages || [])
        .filter((p) => {
            const pos = Number(p.gscPosition || 0);
            return pos > 3 && pos <= 20 && Number(p.gscImpressions || 0) > 100;
        })
        .sort((a, b) => Number(b.gscImpressions || 0) - Number(a.gscImpressions || 0))
        .slice(0, 5), [pages]);

    const cannibal = useMemo(() => (pages || [])
        .filter((p) => p.isCannibalized === true)
        .sort((a, b) => Number(b.gscImpressions || 0) - Number(a.gscImpressions || 0))
        .slice(0, 5), [pages]);

    // Coverage by page category — impressions per category as share of total
    const coverageByCategory = useMemo(() => {
        const totals: Record<string, { impr: number; clicks: number; count: number }> = {};
        for (const p of pages || []) {
            const cat = String(p.pageCategory || 'other');
            totals[cat] ||= { impr: 0, clicks: 0, count: 0 };
            totals[cat].impr   += Number(p.gscImpressions || 0);
            totals[cat].clicks += Number(p.gscClicks || 0);
            totals[cat].count  += 1;
        }
        const palette = ['#F5364E', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];
        return Object.entries(totals)
            .map(([label, v], i) => ({ label, value: v.impr, color: palette[i % palette.length] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 7);
    }, [pages]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
                <StatTile label="Impressions" value={fmtInt(stats.totalImpressions)} />
                <StatTile label="Clicks"      value={fmtInt(stats.totalClicks)} />
                <StatTile label="Avg CTR"     value={fmtPct((stats.avgCtr || 0), 2)} />
                <StatTile label="Avg Pos."    value={stats.avgPosition ? stats.avgPosition.toFixed(1) : '—'} />
            </div>

            {scatter.length > 0 && (
                <Card>
                    <SectionTitle title="Position × CTR" hint="low-right = striking distance" />
                    <ScatterPlot data={scatter} xLabel="Position" yLabel="CTR %" height={160} />
                </Card>
            )}

            {coverageByCategory.length > 0 && (
                <Card>
                    <SectionTitle title="Impressions by page type" />
                    <StackedBar data={coverageByCategory} />
                </Card>
            )}

            <Card>
                <SectionTitle title="Coverage gap" />
                <Row label="Indexed pages"     value={fmtInt(stats.indexedPages)} />
                <Row label="With impressions"  value={fmtInt(stats.indexedPages - stats.pagesWithZeroImpressions)} tone="good" />
                <Row label="Zero impressions"  value={fmtInt(stats.pagesWithZeroImpressions)} tone={stats.pagesWithZeroImpressions > 0 ? 'warn' : 'neutral'} />
                <Row label="Striking distance" value={fmtInt(stats.pagesInStrikingDistance)} tone="accent" hint="pos 4–20, impr > 100" />
                <div className="mt-2"><Bar pct={stats.indexedPages ? ((stats.indexedPages - stats.pagesWithZeroImpressions) / stats.indexedPages) * 100 : 0} tone="good" /></div>
            </Card>

            {strikers.length > 0 && (
                <div>
                    <SectionTitle title="Quick wins (striking distance)" />
                    <Card pad={false}>
                        {strikers.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
                                    <span className="text-[#F5364E] font-bold">pos {Number(p.gscPosition).toFixed(1)}</span>
                                    <span>{fmtInt(p.gscImpressions)} impr</span>
                                    <span>CTR {(Number(p.gscCtr || 0) * 100).toFixed(2)}%</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {winners.length > 0 && (
                <div>
                    <SectionTitle title="Biggest traffic gains" />
                    <Card pad={false}>
                        {winners.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
                                    <span className="text-green-400 font-bold">+{(Number(p.sessionsDeltaPct || 0) * 100).toFixed(0)}%</span>
                                    <span>{fmtInt(p.gscClicks)} clicks</span>
                                    <span>pos {Number(p.gscPosition || 0).toFixed(1)}</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {losers.length > 0 && (
                <div>
                    <SectionTitle title="Biggest traffic drops" />
                    <Card pad={false}>
                        {losers.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
                                    <span className="text-red-400 font-bold">{(Number(p.sessionsDeltaPct || 0) * 100).toFixed(0)}%</span>
                                    <span>{fmtInt(p.gscClicks)} clicks</span>
                                    <span>pos {Number(p.gscPosition || 0).toFixed(1)}</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {cannibal.length > 0 && (
                <div>
                    <SectionTitle title="Cannibalization" hint="multiple pages same query" />
                    <Card pad={false}>
                        {cannibal.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
                                    <span className="text-orange-400 font-bold">{String(p.cannibalizedQuery || '—')}</span>
                                    <span>{fmtInt(p.gscImpressions)} impr</span>
                                    <span>pos {Number(p.gscPosition || 0).toFixed(1)}</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}
        </div>
    );
}
