import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, ChevronDown, ChevronRight, FileText, Wrench } from 'lucide-react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaActionGroups } from '../../../../services/WqaSidebarData';
import { Bar, Card, Chip, SectionTitle, StatTile, fmtInt } from './shared';
import ScatterPlot from '../charts/ScatterPlot';

type SortMode = 'impact' | 'priority' | 'effort';
type CategoryFilter = 'all' | 'technical' | 'content' | 'industry';

const CATEGORY_META: Record<'technical' | 'content' | 'industry', { label: string; Icon: React.ElementType; tone: 'accent' | 'good' | 'warn' }> = {
    technical: { label: 'Technical', Icon: Wrench,        tone: 'accent' },
    content:   { label: 'Content',   Icon: FileText,      tone: 'warn' },
    industry:  { label: 'Industry',  Icon: AlertTriangle, tone: 'good' },
};

const EFFORT_WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 };

export default function WqaActionsTab() {
    const { pages, wqaFilter, setWqaFilter, setSelectedPage } = useSeoCrawler();
    const [filterCat, setFilterCat] = useState<CategoryFilter>('all');
    const [sortMode, setSortMode]   = useState<SortMode>('impact');
    const [openKey, setOpenKey]     = useState<string | null>(null);

    const groups = useMemo(() => computeWqaActionGroups(pages || []), [pages]);

    const filteredGroups = filterCat === 'all' ? groups : groups.filter((g) => g.category === filterCat);

    const sorted = useMemo(() => {
        const arr = [...filteredGroups];
        if (sortMode === 'impact')   arr.sort((a, b) => b.totalEstimatedImpact - a.totalEstimatedImpact);
        if (sortMode === 'priority') arr.sort((a, b) => (a.avgPriority || 99) - (b.avgPriority || 99));
        if (sortMode === 'effort')   arr.sort((a, b) => (EFFORT_WEIGHT[a.effort] || 2) - (EFFORT_WEIGHT[b.effort] || 2));
        return arr;
    }, [filteredGroups, sortMode]);

    const totals = useMemo(() => ({
        technical: groups.filter((g) => g.category === 'technical').reduce((s, g) => s + g.pageCount, 0),
        content:   groups.filter((g) => g.category === 'content').reduce((s, g) => s + g.pageCount, 0),
        industry:  groups.filter((g) => g.category === 'industry').reduce((s, g) => s + g.pageCount, 0),
        impact:    groups.reduce((s, g) => s + g.totalEstimatedImpact, 0),
    }), [groups]);

    const matrix = useMemo(() => groups.map((g) => ({
        x: EFFORT_WEIGHT[g.effort] || 2,
        y: g.totalEstimatedImpact,
        url: `${g.category}:${g.action}`,
        label: g.action,
        color: g.category === 'technical' ? '#F5364E' : g.category === 'content' ? '#f59e0b' : '#22c55e',
    })), [groups]);

    const maxImpact = Math.max(1, ...sorted.map((g) => g.totalEstimatedImpact));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
                <StatTile label="Est. impact"     value={fmtInt(totals.impact)} sub="monthly clicks" tone="accent" />
                <StatTile label="Pages w/ action" value={fmtInt(totals.technical + totals.content + totals.industry)} />
                <StatTile label="Technical"       value={fmtInt(totals.technical)} tone="accent" />
                <StatTile label="Content"         value={fmtInt(totals.content)}   tone="warn" />
            </div>

            {/* Effort × Impact matrix */}
            {matrix.length > 0 && (
                <Card>
                    <SectionTitle title="Effort × impact" hint="bottom-right = best ROI" />
                    <ScatterPlot data={matrix} xLabel="Effort" yLabel="Impact" height={140} xDomain={[0, 4]} showExpectedCurve={false} />
                </Card>
            )}

            {/* Category chips */}
            <div className="flex items-center gap-1 flex-wrap">
                <Chip label={`All (${groups.length})`} tone="neutral" active={filterCat === 'all'}       onClick={() => setFilterCat('all')} />
                <Chip label="Technical"                tone="accent"  active={filterCat === 'technical'} onClick={() => setFilterCat('technical')} />
                <Chip label="Content"                  tone="warn"    active={filterCat === 'content'}   onClick={() => setFilterCat('content')} />
                <Chip label="Industry"                 tone="good"    active={filterCat === 'industry'}  onClick={() => setFilterCat('industry')} />
            </div>

            {/* Sort toggle */}
            <div className="flex items-center gap-1 text-[10px] text-[#888]">
                <span className="text-[#666]">Sort:</span>
                {([['impact', 'Impact'], ['priority', 'Priority'], ['effort', 'Effort']] as Array<[SortMode, string]>).map(([m, l]) => (
                    <button key={m}
                            onClick={() => setSortMode(m)}
                            className={`px-1.5 py-0.5 rounded transition-colors ${sortMode === m ? 'bg-[#F5364E]/15 text-[#F5364E]' : 'hover:bg-[#1a1a1a]'}`}>
                        {l}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <SectionTitle title="Action queue" hint={`${sorted.length} groups`} />
                {sorted.length === 0 ? (
                    <Card><div className="text-[11px] text-[#666] text-center py-4">No actions yet. Run Strategic Audit to populate.</div></Card>
                ) : sorted.map((group) => {
                    const meta = CATEGORY_META[group.category as 'technical' | 'content' | 'industry'];
                    const Icon = meta.Icon;
                    const key = `${group.category}:${group.action}`;
                    const isOpen = openKey === key;
                    const isActiveFilter =
                        (group.category === 'technical' && wqaFilter.technicalAction === group.action) ||
                        (group.category === 'content'   && wqaFilter.contentAction   === group.action);

                    return (
                        <Card key={key}>
                            <button onClick={() => setOpenKey(isOpen ? null : key)} className="w-full text-left">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {isOpen ? <ChevronDown size={11} className="text-[#888]" /> : <ChevronRight size={11} className="text-[#888]" />}
                                            <Icon size={11} className={meta.tone === 'accent' ? 'text-[#F5364E]' : meta.tone === 'warn' ? 'text-orange-400' : 'text-green-400'} />
                                            <Chip label={meta.label} tone={meta.tone} />
                                            <Chip label={`Effort: ${group.effort}`} tone="neutral" />
                                        </div>
                                        <div className="text-[12px] font-bold text-white truncate">{group.action}</div>
                                        {group.reason && <div className="text-[10px] text-[#777] mt-0.5 line-clamp-2">{group.reason}</div>}
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (group.category === 'technical') setWqaFilter({ ...wqaFilter, technicalAction: isActiveFilter ? 'all' : group.action });
                                            else if (group.category === 'content') setWqaFilter({ ...wqaFilter, contentAction: isActiveFilter ? 'all' : group.action });
                                        }}
                                        title="Filter grid to this action"
                                        className="text-[#888] hover:text-white p-1 rounded hover:bg-[#1a1a1a] transition-colors shrink-0"
                                    >
                                        <ArrowUpRight size={12} />
                                    </div>
                                </div>
                            </button>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-[9px] text-[#666] uppercase tracking-widest">Pages</div>
                                    <div className="text-[14px] font-mono font-black text-white">{fmtInt(group.pageCount)}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-[#666] uppercase tracking-widest">Est. impact</div>
                                    <div className="text-[14px] font-mono font-black text-[#F5364E]">{fmtInt(group.totalEstimatedImpact)}</div>
                                </div>
                            </div>

                            <div className="mt-2"><Bar pct={(group.totalEstimatedImpact / maxImpact) * 100} tone={meta.tone === 'accent' ? 'accent' : meta.tone === 'warn' ? 'warn' : 'good'} /></div>

                            {isOpen && group.pages.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[#1a1a1a] space-y-0.5">
                                    {group.pages.slice(0, 10).map((p) => {
                                        const target = (pages || []).find((pp) => pp.url === p.url);
                                        return (
                                            <button
                                                key={p.url}
                                                onClick={() => target && setSelectedPage(target)}
                                                className="w-full text-left hover:bg-[#111] rounded px-1 -mx-1 py-0.5 transition-colors"
                                                title={p.url}
                                            >
                                                <div className="text-[10px] font-mono text-blue-400 truncate">{p.pagePath || p.url}</div>
                                                <div className="text-[9px] text-[#666]">{fmtInt(p.impressions)} impr · pos {p.position?.toFixed(1) || '—'} · est {fmtInt(p.estimatedImpact)}</div>
                                            </button>
                                        );
                                    })}
                                    {group.pageCount > 10 && (
                                        <div className="text-[9px] text-[#555] text-center pt-0.5">+{group.pageCount - 10} more</div>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
