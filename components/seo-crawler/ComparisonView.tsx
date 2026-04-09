import React, { useEffect, useMemo, useState } from 'react';
import { Download, Link2, X } from 'lucide-react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';
import { downloadBlob, exportComparisonCSV } from '../../services/ExportService';

interface ComparisonViewProps {
    onClose: () => void;
}

const summaryRows = [
    { key: 'totalPages', label: 'Total pages', improveWhenHigher: true },
    { key: 'healthScore', label: 'Health score', improveWhenHigher: true },
    { key: 'criticalIssues', label: 'Critical issues', improveWhenHigher: false },
    { key: 'warnings', label: 'Warnings', improveWhenHigher: false },
    { key: 'avgLcp', label: 'Avg LCP', improveWhenHigher: false, formatter: (value: number) => value ? `${(value / 1000).toFixed(2)}s` : '0s' },
    { key: 'schemaCoverage', label: 'Schema coverage', improveWhenHigher: true, formatter: (value: number) => `${value}%` },
    { key: 'notFoundPages', label: '404 pages', improveWhenHigher: false }
];

const formatValue = (value: any) => {
    if (Array.isArray(value)) return value.join(', ') || '—';
    if (value && typeof value === 'object') return JSON.stringify(value);
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
};

const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
    <details className="rounded-2xl border border-[#242428] bg-[#101013]" open={count > 0}>
        <summary className="cursor-pointer list-none px-4 py-3 text-[12px] font-bold uppercase tracking-[0.22em] text-white">
            {title} <span className="ml-2 text-[#777]">{count}</span>
        </summary>
        <div className="border-t border-[#202025] p-4">{children}</div>
    </details>
);

export default function ComparisonView({ onClose }: ComparisonViewProps) {
    const {
        crawlHistory,
        compareSessions,
        diffResult,
        currentSessionId,
        compareSessionId
    } = useSeoCrawler();

    const [leftSessionId, setLeftSessionId] = useState<string | null>(compareSessionId);
    const [rightSessionId, setRightSessionId] = useState<string | null>(currentSessionId);

    const orderedSessions = useMemo(() => crawlHistory.slice(), [crawlHistory]);

    useEffect(() => {
        const latest = orderedSessions[0]?.id || null;
        const previous = orderedSessions[1]?.id || null;
        setLeftSessionId((current) => current || compareSessionId || previous || latest);
        setRightSessionId((current) => current || currentSessionId || latest || previous);
    }, [orderedSessions, compareSessionId, currentSessionId]);

    useEffect(() => {
        if (!leftSessionId || !rightSessionId || leftSessionId === rightSessionId) return;
        void compareSessions(leftSessionId, rightSessionId);
    }, [leftSessionId, rightSessionId, compareSessions]);

    const sessionLookup = useMemo(
        () => new Map(crawlHistory.map((session) => [session.id, session])),
        [crawlHistory]
    );

    const selectedLeft = leftSessionId ? sessionLookup.get(leftSessionId) : null;
    const selectedRight = rightSessionId ? sessionLookup.get(rightSessionId) : null;

    const exportDiff = () => {
        if (!diffResult) return;
        downloadBlob(exportComparisonCSV(diffResult), `headlight_comparison_${leftSessionId}_${rightSessionId}.csv`);
    };

    const shareComparison = async () => {
        if (!leftSessionId || !rightSessionId) return;
        const url = new URL(window.location.href);
        url.searchParams.set('compareOld', leftSessionId);
        url.searchParams.set('compareNew', rightSessionId);
        await navigator.clipboard.writeText(url.toString());
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0b] p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-[#1f1f23] bg-[#111] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#777]">Comparison</div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Compare crawls</h1>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 md:max-w-3xl md:flex-row">
                        <label className="flex-1">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#666]">Baseline crawl</div>
                            <select value={leftSessionId || ''} onChange={(event) => setLeftSessionId(event.target.value)} className="h-11 w-full rounded-xl border border-[#26262b] bg-[#0d0d10] px-3 text-[12px] text-white focus:border-[#F5364E] focus:outline-none">
                                {orderedSessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {new Date(session.startedAt).toLocaleString()} · {session.totalPages} pages
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex-1">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#666]">Current crawl</div>
                            <select value={rightSessionId || ''} onChange={(event) => setRightSessionId(event.target.value)} className="h-11 w-full rounded-xl border border-[#26262b] bg-[#0d0d10] px-3 text-[12px] text-white focus:border-[#F5364E] focus:outline-none">
                                {orderedSessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {new Date(session.startedAt).toLocaleString()} · {session.totalPages} pages
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2f2f35] px-4 text-[12px] font-semibold text-[#ccc] hover:border-[#444] hover:text-white">
                            <X size={14} />
                            Close
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-[#1f1f23] bg-[#111] p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#666]">Summary delta</div>
                                    <div className="mt-1 text-[14px] text-[#c9c9ce]">
                                        {selectedLeft?.url || 'Baseline'} to {selectedRight?.url || 'Current'}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-[#22262b]">
                                <table className="w-full border-collapse text-left text-[12px]">
                                    <thead className="bg-[#141419] text-[#777]">
                                        <tr>
                                            <th className="px-4 py-3 font-bold uppercase tracking-[0.2em]">Metric</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-[0.2em]">Old</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-[0.2em]">New</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-[0.2em]">Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summaryRows.map((row) => {
                                            const values = diffResult?.summaryDelta?.[row.key];
                                            const formatter = row.formatter || ((value: number) => String(value));
                                            const delta = Number(values?.delta || 0);
                                            const improved = row.improveWhenHigher ? delta > 0 : delta < 0;
                                            const regressed = row.improveWhenHigher ? delta < 0 : delta > 0;

                                            return (
                                                <tr key={row.key} className="border-t border-[#1e1e23]">
                                                    <td className="px-4 py-3 text-[#ddd]">{row.label}</td>
                                                    <td className="px-4 py-3 text-[#aaa]">{formatter(Number(values?.old || 0))}</td>
                                                    <td className="px-4 py-3 text-white">{formatter(Number(values?.new || 0))}</td>
                                                    <td className={`px-4 py-3 font-semibold ${improved ? 'text-green-400' : regressed ? 'text-red-400' : 'text-[#888]'}`}>
                                                        {delta > 0 ? '+' : ''}{formatter(delta)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#1f1f23] bg-[#111] p-5">
                            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#666]">Session context</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {[selectedLeft, selectedRight].map((session, index) => (
                                    <div key={session?.id || index} className="rounded-2xl border border-[#212126] bg-[#0d0d10] p-4">
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-[#666]">{index === 0 ? 'Baseline' : 'Current'}</div>
                                        <div className="mt-2 truncate text-[13px] font-semibold text-white">{session?.url || 'No session selected'}</div>
                                        <div className="mt-2 text-[11px] text-[#888]">{session ? new Date(session.startedAt).toLocaleString() : '—'}</div>
                                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                            <span className="rounded-full border border-[#2c2c31] bg-[#17171b] px-3 py-1 text-[#ddd]">{session?.totalPages || 0} pages</span>
                                            <span className="rounded-full border border-[#2c2c31] bg-[#17171b] px-3 py-1 text-[#ddd]">{session?.healthScore || 0}/100</span>
                                            <span className="rounded-full border border-[#2c2c31] bg-[#17171b] px-3 py-1 text-[#ddd]">{session?.totalIssues || 0} issues</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-[#1f1f23] bg-[#111] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#666]">Page-level changes</div>
                                <div className="mt-1 text-[13px] text-[#aaa]">Added, removed, changed, fixed, and new issues across both sessions.</div>
                            </div>
                        </div>

                        <Section title="+ New pages" count={diffResult?.added?.length || 0}>
                            <div className="space-y-3">
                                {(diffResult?.added || []).map((page: any) => (
                                    <div key={page.url} className="rounded-xl border border-[#1f2f24] bg-[#0c130f] p-3">
                                        <div className="truncate text-[12px] font-semibold text-white">{page.url}</div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#9ac1a2]">
                                            <span>Status {page.statusCode || '—'}</span>
                                            <span>Score {page.healthScore ?? '—'}</span>
                                            <span>Words {page.wordCount ?? 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="- Removed pages" count={diffResult?.removed?.length || 0}>
                            <div className="space-y-3">
                                {(diffResult?.removed || []).map((page: any) => (
                                    <div key={page.url} className="rounded-xl border border-[#332126] bg-[#150d10] p-3">
                                        <div className="truncate text-[12px] font-semibold text-white">{page.url}</div>
                                        <div className="mt-2 text-[11px] text-[#d1a2ab]">Last known status {page.statusCode || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="~ Changed pages" count={diffResult?.changed?.length || 0}>
                            <div className="space-y-3">
                                {(diffResult?.changed || []).map((change: any) => (
                                    <div key={change.url} className="rounded-xl border border-[#232832] bg-[#0e1016] p-3">
                                        <div className="truncate text-[12px] font-semibold text-white">{change.url}</div>
                                        <div className="mt-3 space-y-2">
                                            {(change.fieldChanges || []).map((fieldChange: any) => (
                                                <div key={fieldChange.field} className="grid gap-2 rounded-lg border border-[#1d2127] bg-[#0a0c10] p-3 text-[11px] md:grid-cols-[140px_1fr_24px_1fr]">
                                                    <div className="font-semibold uppercase tracking-[0.16em] text-[#777]">{fieldChange.field}</div>
                                                    <div className="text-[#bbb]">{formatValue(fieldChange.oldValue)}</div>
                                                    <div className="text-center text-[#666]">→</div>
                                                    <div className="text-white">{formatValue(fieldChange.newValue)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="✓ Issues fixed" count={diffResult?.issuesFixed?.length || 0}>
                            <div className="space-y-3">
                                {(diffResult?.issuesFixed || []).map((entry: any) => (
                                    <div key={entry.url} className="rounded-xl border border-[#1f2f24] bg-[#0c130f] p-3">
                                        <div className="truncate text-[12px] font-semibold text-white">{entry.url}</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(entry.issues || []).map((issue: any) => (
                                                <span key={issue.id} className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] text-green-300">
                                                    {issue.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="✗ New issues" count={diffResult?.newIssues?.length || 0}>
                            <div className="space-y-3">
                                {(diffResult?.newIssues || []).map((entry: any) => (
                                    <div key={entry.url} className="rounded-xl border border-[#332126] bg-[#150d10] p-3">
                                        <div className="truncate text-[12px] font-semibold text-white">{entry.url}</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(entry.issues || []).map((issue: any) => (
                                                <span key={issue.id} className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-300">
                                                    {issue.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <div className="flex flex-wrap gap-3 border-t border-[#1f1f24] pt-4">
                            <button onClick={exportDiff} className="inline-flex items-center gap-2 rounded-xl border border-[#2f2f35] px-4 py-3 text-[12px] font-semibold text-white hover:border-[#444]">
                                <Download size={14} />
                                Export Diff Report
                            </button>
                            <button onClick={() => { void shareComparison(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#2f2f35] px-4 py-3 text-[12px] font-semibold text-white hover:border-[#444]">
                                <Link2 size={14} />
                                Share Comparison
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
