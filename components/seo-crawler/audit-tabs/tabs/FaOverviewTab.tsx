import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Network } from 'lucide-react';
import { useFaSidebarData } from '../../../../services/FaSidebarData';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import {
    Card, StatTile, StackedBar, Donut, Gauge, BarMini, EmptyHint,
    fmtNumber, fmtPct, fmtDuration, type Tone,
} from '../shared';

export default function FaOverviewTab() {
    const data = useFaSidebarData();
    const { setFaSidebarTab } = useSeoCrawler() as any;
    const o = data.overview;

    if (o.totalPages === 0) {
        return (
            <EmptyHint
                icon={<Network size={20} />}
                title="No pages crawled yet"
                sub="Start a crawl from the header to populate the Full Audit overview."
            />
        );
    }

    const statusSegments: Array<{ label: string; value: number; tone: Tone }> = [
        { label: '2xx', value: o.statusMix['2xx'], tone: 'good' },
        { label: '3xx', value: o.statusMix['3xx'], tone: 'info' },
        { label: '4xx', value: o.statusMix['4xx'], tone: 'warn' },
        { label: '5xx', value: o.statusMix['5xx'], tone: 'bad' },
    ];

    const depthMax = Math.max(1, ...o.depthHistogram);

    const issuesTone: Tone = o.issuesDelta < 0 ? 'good' : o.issuesDelta > 0 ? 'bad' : 'mute';
    const newPagesTone: Tone = o.newPages > 0 ? 'info' : 'mute';

    return (
        <div className="space-y-3">
            <Card title="Site score">
                <div className="flex items-center gap-3">
                    <Gauge value={data.scores.overall} tone={data.scores.overall >= 80 ? 'good' : data.scores.overall >= 60 ? 'info' : 'warn'} sub={`${fmtPct(o.indexablePct, 0)} indexable`} />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <StatTile label="Pages" value={fmtNumber(o.totalPages)} sub={`${fmtNumber(o.indexable)} indexable`} />
                        <StatTile label="Issues" value={fmtNumber(o.issuesTotal)} delta={o.issuesDelta || undefined} tone={issuesTone} />
                    </div>
                </div>
            </Card>

            <Card title="Status mix">
                <StackedBar segments={statusSegments} />
            </Card>

            <Card title="Depth distribution">
                <div className="space-y-2">
                    {o.depthHistogram.map((count, i) => (
                        <BarMini
                            key={`d${i}`}
                            label={i === 5 ? 'd5+' : `d${i}`}
                            value={count}
                            max={depthMax}
                            count={count}
                            tone={i >= 4 ? 'warn' : 'info'}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Category mix">
                {o.categoryDonut.length === 0 ? (
                    <div className="text-[11px] text-[#666]">No categories detected.</div>
                ) : (
                    <Donut
                        slices={o.categoryDonut.map((s) => ({ label: s.label, value: s.count }))}
                        center={`${o.categoryDonut.length}`}
                    />
                )}
            </Card>

            <Card title="Crawl">
                {o.crawlProgress.stage === 'idle' ? (
                    <div className="flex items-center gap-2 text-[11px] text-[#888]">
                        <CheckCircle2 size={12} className="text-green-400" />
                        Idle. Last run completed.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#ccc] capitalize">{o.crawlProgress.stage}</span>
                            <span className="font-mono text-[#888] tabular-nums">{fmtNumber(o.crawlProgress.completed)} / {fmtNumber(o.crawlProgress.total)}</span>
                        </div>
                        <BarMini label="Progress" value={o.crawlProgress.completed} max={Math.max(1, o.crawlProgress.total)} tone="info" />
                        <div className="flex items-center gap-3 text-[10px] text-[#777]">
                            <span>ETA {fmtDuration(o.crawlProgress.etaSec * 1000)}</span>
                            <span className={o.crawlProgress.errors > 0 ? 'text-red-400' : 'text-[#777]'}>
                                {o.crawlProgress.errors > 0 && <AlertTriangle size={10} className="inline mr-0.5" />}
                                {o.crawlProgress.errors} errors
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            <button
                onClick={() => setFaSidebarTab('fa_issues')}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-[#111] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
            >
                <span className="text-[11px] text-[#ccc]">Open Issues</span>
                <ArrowRight size={12} className="text-[#666]" />
            </button>
            {o.newPages > 0 && (
                <div className="text-[10px] text-[#777]">
                    <span className={`font-mono mr-1 ${newPagesTone === 'info' ? 'text-blue-400' : ''}`}>+{o.newPages}</span>
                    new pages since last session
                </div>
            )}
        </div>
    );
}
