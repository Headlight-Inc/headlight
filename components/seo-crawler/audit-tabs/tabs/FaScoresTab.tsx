import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useFaSidebarData } from '../../../../services/FaSidebarData';
import {
    Card, Gauge, BarMini, EmptyHint,
    fmtNumber, fmtDelta, type Tone,
} from '../shared';

const BAND_LABELS = ['0-20', '20-40', '40-60', '60-80', '80-100'];

function toneForScore(s: number): Tone {
    if (s >= 80) return 'good';
    if (s >= 60) return 'info';
    if (s >= 40) return 'warn';
    return 'bad';
}

export default function FaScoresTab() {
    const { scores, overview } = useFaSidebarData();

    if (overview.totalPages === 0) {
        return <EmptyHint title="Scores will appear after the first crawl" />;
    }

    const components: Array<[string, number]> = [
        ['Content',  scores.components.content],
        ['Tech',     scores.components.tech],
        ['Schema',   scores.components.schema],
        ['Links',    scores.components.links],
        ['A11y',     scores.components.a11y],
        ['Security', scores.components.security],
    ];
    const distMax = Math.max(1, ...scores.distribution);
    const overallTone = toneForScore(scores.overall);

    return (
        <div className="space-y-3">
            <Card title="Composite">
                <div className="flex items-center gap-4">
                    <Gauge value={scores.overall} tone={overallTone} sub={fmtDelta(scores.overallDelta)} />
                    <div className="flex-1 text-[11px] text-[#aaa] leading-snug">
                        Cohort percentile <span className="font-mono text-white tabular-nums">{scores.cohortPercentile}</span>
                        <div className="text-[10px] text-[#666] mt-0.5">vs sites in your industry / size class</div>
                    </div>
                </div>
            </Card>

            <Card title="Sub-scores">
                <div className="space-y-2">
                    {components.map(([label, value]) => (
                        <BarMini
                            key={label}
                            label={label}
                            value={value}
                            max={100}
                            count={value}
                            tone={toneForScore(value)}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Page score distribution">
                <div className="space-y-2">
                    {scores.distribution.map((count, i) => (
                        <BarMini
                            key={BAND_LABELS[i]}
                            label={BAND_LABELS[i]}
                            value={count}
                            max={distMax}
                            count={count}
                            tone={i >= 3 ? 'good' : i === 2 ? 'info' : i === 1 ? 'warn' : 'bad'}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Movers (vs last session)">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-green-400" />
                        <span className="text-[12px] font-bold text-white tabular-nums">{fmtNumber(scores.moversUp)}</span>
                        <span className="text-[10px] text-[#888]">improved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TrendingDown size={13} className="text-red-400" />
                        <span className="text-[12px] font-bold text-white tabular-nums">{fmtNumber(scores.moversDown)}</span>
                        <span className="text-[10px] text-[#888]">declined</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
