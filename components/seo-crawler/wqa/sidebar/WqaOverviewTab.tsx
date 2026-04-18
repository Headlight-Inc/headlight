import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Globe, Languages, Server } from 'lucide-react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSiteStats, deriveWqaScore } from '../../../../services/WqaSidebarData';
import { Bar, Card, Chip, Row, SectionTitle, StatTile, fmtInt, fmtPct, fmtScore, scoreTone } from './shared';
import StackedBar from '../charts/StackedBar';
import SunburstChart from '../charts/SunburstChart';

export default function WqaOverviewTab() {
    const { pages, wqaState, filteredWqaPagesExport, setWqaFilter, wqaFilter } = useSeoCrawler();

    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';
    const stats = useMemo(() => computeWqaSiteStats(pages || [], industry as any), [pages, industry]);
    const { score, grade } = useMemo(() => deriveWqaScore(stats), [stats]);

    const radarData = [
        { axis: 'Content',    value: stats.radarContent },
        { axis: 'SEO',        value: stats.radarSeo },
        { axis: 'Authority',  value: stats.radarAuthority },
        { axis: 'UX',         value: stats.radarUx },
        { axis: 'Search',     value: stats.radarSearchPerf },
        { axis: 'Trust',      value: stats.radarTrust },
    ];

    const valueMix = [
        { label: 'High',   value: stats.highValuePages,   color: '#22c55e' },
        { label: 'Medium', value: stats.mediumValuePages, color: '#3b82f6' },
        { label: 'Low',    value: stats.lowValuePages,    color: '#f59e0b' },
        { label: 'Zero',   value: stats.zeroValuePages,   color: '#ef4444' },
    ];

    const indexabilityMix = [
        { label: 'Indexed', value: stats.indexedPages,                                   color: '#22c55e' },
        { label: 'Blocked', value: Math.max(0, stats.htmlPages - stats.indexedPages),    color: '#ef4444' },
    ];

    const categorySunburst = Object.entries(stats.pagesByCategory || {})
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    return (
        <div className="space-y-4">
            {/* ── Hero: WQA score + grade + site identity ── */}
            <Card>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-[9px] text-[#666] uppercase tracking-widest">Website quality</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <div className={`text-[40px] font-black leading-none ${scoreTone(score) === 'good' ? 'text-green-400' : scoreTone(score) === 'warn' ? 'text-orange-400' : 'text-red-400'}`}>{score}</div>
                            <div className="text-[22px] font-black text-[#888]">{grade}</div>
                        </div>
                    </div>
                    <div className="text-right text-[10px] text-[#888] space-y-1">
                        <div className="flex items-center gap-1 justify-end"><Globe size={10} />{fmtInt(stats.totalPages)} pages</div>
                        <div className="flex items-center gap-1 justify-end"><Languages size={10} />{wqaState.detectedLanguage || '—'}</div>
                        <div className="flex items-center gap-1 justify-end"><Server size={10} />{wqaState.detectedCms || '—'}</div>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                    <Chip label={`Industry: ${industry}`} tone="accent" />
                    {wqaState.isMultiLanguage && <Chip label="Multi-language" tone="neutral" />}
                    {wqaState.isLowIndustryConfidence && <Chip label="Low confidence" tone="warn" />}
                </div>
            </Card>

            {/* ── Radar: 6-axis quality fingerprint ── */}
            <Card pad={false}>
                <div className="px-3 pt-3">
                    <SectionTitle title="Quality fingerprint" hint="0–100 per axis" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                        <PolarGrid stroke="#1f1f1f" />
                        <PolarAngleAxis dataKey="axis" tick={{ fill: '#888', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="value" stroke="#F5364E" fill="#F5364E" fillOpacity={0.25} strokeWidth={1.5} />
                    </RadarChart>
                </ResponsiveContainer>
            </Card>

            {/* ── Search performance summary ── */}
            <div>
                <SectionTitle title="Search performance" hint="30 days" />
                <div className="grid grid-cols-2 gap-1.5">
                    <StatTile label="Impressions" value={fmtInt(stats.totalImpressions)} />
                    <StatTile label="Clicks"      value={fmtInt(stats.totalClicks)} />
                    <StatTile label="Avg CTR"     value={fmtPct((stats.avgCtr || 0) * 100, 2)} />
                    <StatTile label="Avg Pos."    value={stats.avgPosition ? stats.avgPosition.toFixed(1) : '—'} />
                </div>
            </div>

            {/* ── Value distribution ── */}
            <Card>
                <SectionTitle title="Value distribution" hint={`${fmtInt(stats.totalPages)} pages`} />
                <StackedBar data={valueMix} />
            </Card>

            {/* ── Indexability + sitemap ── */}
            <Card>
                <SectionTitle title="Indexability & sitemap" />
                <StackedBar data={indexabilityMix} />
                <div className="mt-3 space-y-0.5">
                    <Row label="Sitemap coverage" value={fmtPct(stats.sitemapCoverage, 1)}
                         tone={stats.sitemapCoverage >= 80 ? 'good' : stats.sitemapCoverage >= 50 ? 'warn' : 'bad'} />
                    {industry === 'news' && (
                        <Row label="News sitemap" value={fmtPct(stats.newsSitemapCoverage, 1)}
                             hint="Google News eligibility"
                             tone={stats.newsSitemapCoverage > 0 ? 'good' : 'warn'} />
                    )}
                    <Row label="Schema coverage"  value={fmtPct(stats.schemaCoverage, 1)} />
                </div>
            </Card>

            {/* ── Risk signals: clickable facets ── */}
            <div>
                <SectionTitle title="Risk signals" hint="Click to filter" />
                <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => setWqaFilter({ ...wqaFilter, trafficStatus: 'declining' })}
                            className="text-left">
                        <StatTile label="Losing traffic" value={fmtInt(stats.pagesLosingTraffic)} tone={stats.pagesLosingTraffic > 0 ? 'bad' : 'neutral'} />
                    </button>
                    <button onClick={() => setWqaFilter({ ...wqaFilter, searchStatus: 'none' })}
                            className="text-left">
                        <StatTile label="0 impressions"  value={fmtInt(stats.pagesWithZeroImpressions)} tone={stats.pagesWithZeroImpressions > 0 ? 'warn' : 'neutral'} />
                    </button>
                    <StatTile label="Orphans w/ value"  value={fmtInt(stats.orphanPagesWithValue)} tone={stats.orphanPagesWithValue > 0 ? 'warn' : 'neutral'} />
                    <StatTile label="Cannibalization"   value={fmtInt(stats.cannibalizationCount)} tone={stats.cannibalizationCount > 0 ? 'warn' : 'neutral'} />
                    <button onClick={() => setWqaFilter({ ...wqaFilter, searchStatus: 'striking' })}
                            className="text-left">
                        <StatTile label="Striking dist." value={fmtInt(stats.pagesInStrikingDistance)} tone={stats.pagesInStrikingDistance > 0 ? 'accent' : 'neutral'} />
                    </button>
                    <StatTile label="Decay risk"        value={fmtInt(stats.decayRiskCount)} tone={stats.decayRiskCount > 0 ? 'warn' : 'neutral'} />
                </div>
            </div>

            {/* ── Page category breakdown ── */}
            {categorySunburst.length > 0 && (
                <Card>
                    <SectionTitle title="Page categories" hint={`${Object.keys(stats.pagesByCategory).length} types`} />
                    <div className="flex items-center gap-3">
                        <SunburstChart data={categorySunburst} size={120} />
                        <div className="flex-1 space-y-0.5">
                            {categorySunburst.slice(0, 6).map((c) => (
                                <button key={c.label}
                                        onClick={() => setWqaFilter({ ...wqaFilter, pageCategory: c.label })}
                                        className="w-full">
                                    <Row label={c.label} value={fmtInt(c.value)} />
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* ── Current view summary ── */}
            <Card>
                <SectionTitle title="Current filter" />
                <Row label="Visible pages" value={`${fmtInt(filteredWqaPagesExport.length)} / ${fmtInt(stats.totalPages)}`} />
                <div className="mt-2">
                    <Bar pct={stats.totalPages > 0 ? (filteredWqaPagesExport.length / stats.totalPages) * 100 : 0} />
                </div>
            </Card>
        </div>
    );
}
