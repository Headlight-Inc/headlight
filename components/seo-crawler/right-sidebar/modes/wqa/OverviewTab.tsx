import * as React from 'react';
import { useMemo } from 'react';
import { Globe, Languages, Server } from 'lucide-react';
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext';
import { deriveWqaScore } from '@/services/right-sidebar/wqa';
import { Bar, Card, Chip, Row, SectionTitle, StatTile, Gauge } from '../../shared/primitives';
import { MiniRadar } from '../../shared/charts';
import { fmtInt, fmtPct, scoreTone } from '../../shared/format';
import type { RsTabProps } from '@/services/right-sidebar/types';
import type { WqaSiteStats } from '@/services/right-sidebar/wqa';

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 };

export function OverviewTab({ stats }: RsTabProps<WqaSiteStats>) {
    const { wqaState, setWqaFilter, wqaFilter, filteredWqaPagesExport } = useSeoCrawler();
    const { score, grade } = useMemo(() => deriveWqaScore(stats), [stats]);

    const radarData = [
        { axis: 'Content',    value: stats.radarContent },
        { axis: 'SEO',        value: stats.radarSeo },
        { axis: 'Authority',  value: stats.radarAuthority },
        { axis: 'UX',         value: stats.radarUx },
        { axis: 'Search',     value: stats.radarSearchPerf },
        { axis: 'Trust',      value: stats.radarTrust },
    ];

    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';

    return (
        <div className="space-y-4">
            <SectionTitle>Website Quality</SectionTitle>
            <Card>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <div className={`text-[32px] font-black leading-none`} style={{ color: scoreTone(score) }}>{score}</div>
                            <div className="text-[18px] font-black text-neutral-500">{grade}</div>
                        </div>
                    </div>
                    <div className="text-right text-[10px] text-neutral-500 space-y-1">
                        <div className="flex items-center gap-1 justify-end"><Globe size={10} />{fmtInt(stats.totalPages)} pages</div>
                        <div className="flex items-center gap-1 justify-end"><Languages size={10} />{wqaState.detectedLanguage || '—'}</div>
                        <div className="flex items-center gap-1 justify-end"><Server size={10} />{wqaState.detectedCms || '—'}</div>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                    <Chip tone="accent">Industry: {industry}</Chip>
                    {wqaState.isMultiLanguage && <Chip tone="neutral">Multi-language</Chip>}
                </div>
            </Card>

            <SectionTitle>Quality fingerprint</SectionTitle>
            <Card>
                <MiniRadar data={radarData} />
            </Card>

            <SectionTitle>Search performance (30d)</SectionTitle>
            <div className="px-3 grid grid-cols-2 gap-1.5">
                <StatTile label="Impressions" value={fmtInt(stats.totalImpressions)} />
                <StatTile label="Clicks"      value={fmtInt(stats.totalClicks)} />
                <StatTile label="Avg CTR"     value={fmtPct(stats.avgCtr)} />
                <StatTile label="Avg Pos."    value={stats.avgPosition ? stats.avgPosition.toFixed(1) : '—'} />
            </div>

            <SectionTitle>Risk signals</SectionTitle>
            <div className="px-3 grid grid-cols-2 gap-1.5">
                <button onClick={() => setWqaFilter({ ...wqaFilter, trafficStatus: 'declining' })} className="text-left">
                    <StatTile label="Losing traffic" value={fmtInt(stats.pagesLosingTraffic)} tone={stats.pagesLosingTraffic > 0 ? 'bad' : 'neutral'} />
                </button>
                <button onClick={() => setWqaFilter({ ...wqaFilter, searchStatus: 'none' })} className="text-left">
                    <StatTile label="0 impressions"  value={fmtInt(stats.pagesWithZeroImpressions)} tone={stats.pagesWithZeroImpressions > 0 ? 'warn' : 'neutral'} />
                </button>
                <StatTile label="Orphans w/ value"  value={fmtInt(stats.orphanPagesWithValue)} tone={stats.orphanPagesWithValue > 0 ? 'warn' : 'neutral'} />
                <StatTile label="Decay risk"        value={fmtInt(stats.decayRiskCount)} tone={stats.decayRiskCount > 0 ? 'warn' : 'neutral'} />
            </div>

            <SectionTitle>Current filter</SectionTitle>
            <Card>
                <Row label="Visible pages" value={`${fmtInt(filteredWqaPagesExport?.length || 0)} / ${fmtInt(stats.totalPages)}`} />
                <div className="mt-2">
                    <Bar value={stats.totalPages > 0 ? ((filteredWqaPagesExport?.length || 0) / stats.totalPages) * 100 : 0} />
                </div>
            </Card>
        </div>
    );
}
