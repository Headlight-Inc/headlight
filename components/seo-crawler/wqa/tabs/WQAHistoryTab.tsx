import React, { useMemo } from 'react';
import type { WebsiteQualityState, WqaSiteStats } from '../../../../services/WebsiteQualityModeTypes';
import { scoreToGrade } from '../../../../services/WebsiteQualityModeTypes';
import type { CrawlSession } from '../../../../services/CrawlHistoryService';

interface Props {
    stats: WqaSiteStats | null;
    wqaState: WebsiteQualityState;
    crawlHistory: CrawlSession[];
    currentSessionId: string | null;
    onCompare: (id1: string, id2: string) => void;
}

export default function WQAHistoryTab({
    stats,
    wqaState,
    crawlHistory,
    currentSessionId,
    onCompare,
}: Props) {
    // Sorted: newest first, completed only
    const sessions = useMemo(
        () =>
            crawlHistory
                .filter((s) => s.completedAt)
                .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
                .slice(0, 12),
        [crawlHistory],
    );

    if (!stats || sessions.length === 0) {
        return (
            <div className="p-8 text-center text-[12px] text-[#555]">
                No crawl history yet.
            </div>
        );
    }

    const current  = sessions[0];
    const previous = sessions[1];

    // Chart data (oldest → newest)
    const chartData = useMemo(() => [...sessions].reverse(), [sessions]);

    return (
        <div className="p-3 space-y-5">

            {/* ── Score trend ── */}
            <section>
                <SectionHeader title="Score Over Time" />
                {chartData.length >= 2 ? (
                    <ScoreTrendChart
                        sessions={chartData}
                        currentSessionId={currentSessionId}
                    />
                ) : (
                    <p className="text-[11px] text-[#555]">
                        Need at least 2 crawls to show trend.
                    </p>
                )}
            </section>

            {/* ── Current WQA composite score ── */}
            {wqaState.siteScore > 0 && (
                <section>
                    <SectionHeader title="WQA Score (Current)" />
                    <div className="bg-[#141414] border border-[#222] rounded p-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-[#555]">Composite score</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[24px] font-bold leading-none text-white">
                                    {wqaState.siteScore}
                                </span>
                                <span className="text-[14px] text-[#666]">
                                    {wqaState.siteGrade}
                                </span>
                            </div>
                        </div>

                        {wqaState.scoreDelta !== 0 && (
                            <p
                                className={`text-[10px] mt-1 ${
                                    wqaState.scoreDelta > 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                            >
                                {wqaState.scoreDelta > 0 ? '▲' : '▼'}{' '}
                                {Math.abs(wqaState.scoreDelta)} pts from previous crawl
                            </p>
                        )}

                        {wqaState.siteStats && (
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#1a1a1a]">
                                {(
                                    [
                                        ['Content',   wqaState.siteStats.radarContent],
                                        ['SEO',       wqaState.siteStats.radarSeo],
                                        ['Authority', wqaState.siteStats.radarAuthority],
                                        ['UX',        wqaState.siteStats.radarUx],
                                        ['Search',    wqaState.siteStats.radarSearchPerf],
                                        ['Trust',     wqaState.siteStats.radarTrust],
                                    ] as const
                                ).map(([label, val]) => (
                                    <div key={label} className="text-center">
                                        <div
                                            className={`text-[12px] font-mono font-semibold ${
                                                val >= 70
                                                    ? 'text-green-400'
                                                    : val >= 50
                                                    ? 'text-yellow-400'
                                                    : 'text-red-400'
                                            }`}
                                        >
                                            {val}
                                        </div>
                                        <div className="text-[9px] text-[#555] mt-0.5">
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Changes since last crawl ── */}
            {current && previous && (
                <section>
                    <SectionHeader title="Changes Since Last Crawl" />
                    <div className="space-y-1">
                        <DeltaRow
                            label="Health Score"
                            current={Number(current.healthScore  || 0)}
                            previous={Number(previous.healthScore || 0)}
                            higherIsBetter
                            format={(v) => `${scoreToGrade(v)} (${v})`}
                        />
                        <DeltaRow
                            label="Pages"
                            current={Number(current.totalPages  || 0)}
                            previous={Number(previous.totalPages || 0)}
                            higherIsBetter
                        />
                        {current.totalIssues !== undefined &&
                            previous.totalIssues !== undefined && (
                                <DeltaRow
                                    label="Issues"
                                    current={Number(current.totalIssues  || 0)}
                                    previous={Number(previous.totalIssues || 0)}
                                    higherIsBetter={false}
                                />
                            )}
                    </div>
                </section>
            )}

            {/* ── Session list ── */}
            <section>
                <SectionHeader title="Crawl Sessions" />
                <div className="space-y-1.5">
                    {sessions.map((s, idx) => {
                        const isCurrent = s.id === currentSessionId;
                        const score     = Number(s.healthScore || 0);
                        const grade     = scoreToGrade(score);
                        const prev      = sessions[idx + 1];
                        const delta     = prev
                            ? score - Number(prev.healthScore || 0)
                            : null;

                        return (
                                <div
                                key={s.id}
                                className={`bg-[#141414] border rounded p-2 transition-colors ${
                                    isCurrent
                                        ? 'border-[#F5364E]/25'
                                        : 'border-[#222] hover:border-[#333]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                isCurrent ? 'bg-[#F5364E]' : 'bg-[#2a2a2a]'
                                            }`}
                                        />
                                        <span className="text-[10px] text-[#888]">
                                            {formatDate(s.completedAt)}
                                        </span>
                                        {isCurrent && (
                                            <span className="text-[8px] text-[#F5364E] uppercase tracking-wider">
                                                current
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {delta !== null && delta !== 0 && (
                                            <span
                                                className={`text-[9px] font-mono ${
                                                    delta > 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                            >
                                                {delta > 0 ? `+${delta}` : delta}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-white font-mono">
                                            {grade} ({score})
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px] text-[#555]">
                                        {s.totalPages || '—'} pages
                                        {s.totalIssues !== undefined
                                            ? ` · ${s.totalIssues} issues`
                                            : ''}
                                    </span>
                                    {!isCurrent && currentSessionId && (
                                        <button
                                            onClick={() => onCompare(currentSessionId, s.id)}
                                            className="text-[9px] text-[#F5364E]/60 hover:text-[#F5364E] transition-colors"
                                        >
                                            Compare ↔
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

// ─── SVG trend chart (no recharts) ───────────────────────────────────────────

function ScoreTrendChart({
    sessions,
    currentSessionId,
}: {
    sessions: CrawlSession[];
    currentSessionId: string | null;
}) {
    const W = 272, H = 96;
    const PAD = { t: 8, r: 6, b: 20, l: 24 };
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;

    const scores = sessions.map((s) => Number(s.healthScore || 0));
    const lo = Math.max(0,   Math.min(...scores) - 8);
    const hi = Math.min(100, Math.max(...scores) + 8);
    const rng = hi - lo || 1;

    const sx = (i: number) => PAD.l + (i / Math.max(sessions.length - 1, 1)) * plotW;
    const sy = (v: number) => PAD.t + plotH - ((v - lo) / rng) * plotH;

    const pts = sessions.map((s, i) => ({
        x:         sx(i),
        y:         sy(Number(s.healthScore || 0)),
        score:     Number(s.healthScore || 0),
        label:     formatDateShort(s.completedAt),
        isCurrent: s.id === currentSessionId,
        isFirst:   i === 0,
        isLast:    i === sessions.length - 1,
    }));

    const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const areaD =
        pts.length > 1
            ? `M ${pts[0].x},${PAD.t + plotH} ` +
              pts.map((p) => `L ${p.x},${p.y}`).join(' ') +
              ` L ${pts[pts.length - 1].x},${PAD.t + plotH} Z`
            : '';

    const yTicks = [
        Math.round(lo + rng * 0.33),
        Math.round(lo + rng * 0.66),
    ];

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            style={{ overflow: 'visible' }}
        >
            {/* Y gridlines */}
            {yTicks.map((t) => (
                <g key={t}>
                    <line
                        x1={PAD.l}
                        y1={sy(t)}
                        x2={PAD.l + plotW}
                        y2={sy(t)}
                        stroke="#1a1a1a"
                        strokeWidth="1"
                    />
                    <text
                        x={PAD.l - 4}
                        y={sy(t) + 3}
                        textAnchor="end"
                        fill="#444"
                        fontSize="7"
                    >
                        {t}
                    </text>
                </g>
            ))}

            {/* Area fill */}
            {areaD && (
                <path d={areaD} fill="#F5364E" fillOpacity="0.07" />
            )}

            {/* Line */}
            <polyline
                points={polyline}
                fill="none"
                stroke="#F5364E"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Points */}
            {pts.map((p, i) => (
                <g key={i}>
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={p.isCurrent ? 4 : 2.5}
                        fill={p.isCurrent ? '#F5364E' : '#111'}
                        stroke="#F5364E"
                        strokeWidth="1.5"
                    />
                    {(p.isFirst || p.isLast || p.isCurrent) && (
                        <text
                            x={p.x}
                            y={PAD.t + plotH + 12}
                            textAnchor="middle"
                            fill={p.isCurrent ? '#F5364E' : '#444'}
                            fontSize="7"
                        >
                            {p.label}
                        </text>
                    )}
                </g>
            ))}
        </svg>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function DeltaRow({
    label,
    current,
    previous,
    higherIsBetter,
    format,
}: {
    label: string;
    current: number;
    previous: number;
    higherIsBetter?: boolean;
    format?: (v: number) => string;
}) {
    const delta    = current - previous;
    const positive = higherIsBetter ? delta > 0 : delta < 0;
    const display  = format ? format(current) : current.toLocaleString();

    return (
        <div className="flex justify-between text-[10px]">
            <span className="text-[#888]">{label}</span>
            <span className="text-white font-mono flex items-center gap-1.5">
                {display}
                {delta !== 0 && (
                    <span
                        className={`text-[9px] ${
                            positive ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                        {delta > 0 ? '+' : ''}
                        {delta}
                    </span>
                )}
            </span>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#888] border-b border-[#222] pb-1 mb-3">
            {title}
        </h4>
    );
}

function formatDate(ts: number | null | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateShort(ts: number | null | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
