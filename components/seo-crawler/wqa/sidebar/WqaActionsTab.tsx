import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, FileText, Wrench } from 'lucide-react';
import { useSeoCrawler, type WqaSidebarTab } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaActionGroups } from '../../../../services/WqaSidebarData';
import { Bar, Card, Chip, Row, SectionTitle, StatTile, fmtInt } from './shared';

const CATEGORY_META: Record<'technical' | 'content' | 'industry', { label: string; Icon: React.ElementType; tone: 'accent' | 'good' | 'warn' }> = {
    technical: { label: 'Technical', Icon: Wrench,     tone: 'accent' },
    content:   { label: 'Content',   Icon: FileText,   tone: 'warn' },
    industry:  { label: 'Industry',  Icon: AlertTriangle, tone: 'good' },
};

export default function WqaActionsTab() {
    const { pages, wqaFilter, setWqaFilter, setSelectedPage } = useSeoCrawler();
    const [filterCat, setFilterCat] = useState<'all' | 'technical' | 'content' | 'industry'>('all');

    const groups = useMemo(() => computeWqaActionGroups(pages || []), [pages]);

    const filteredGroups = filterCat === 'all' ? groups : groups.filter((g) => g.category === filterCat);
    const sorted = [...filteredGroups].sort((a, b) => b.totalEstimatedImpact - a.totalEstimatedImpact);

    const totals = useMemo(() => ({
        technical: groups.filter((g) => g.category === 'technical').reduce((s, g) => s + g.pageCount, 0),
        content:   groups.filter((g) => g.category === 'content').reduce((s, g) => s + g.pageCount, 0),
        industry:  groups.filter((g) => g.category === 'industry').reduce((s, g) => s + g.pageCount, 0),
        impact:    groups.reduce((s, g) => s + g.totalEstimatedImpact, 0),
    }), [groups]);

    const maxImpact = Math.max(1, ...sorted.map((g) => g.totalEstimatedImpact));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
                <StatTile label="Est. impact" value={fmtInt(totals.impact)} sub="monthly clicks" tone="accent" />
                <StatTile label="Pages w/ action" value={fmtInt(totals.technical + totals.content + totals.industry)} />
                <StatTile label="Technical" value={fmtInt(totals.technical)} tone="accent" />
                <StatTile label="Content"   value={fmtInt(totals.content)}   tone="warn" />
            </div>

            <div className="flex items-center gap-1 flex-wrap">
                <Chip label={`All (${groups.length})`} tone="neutral" active={filterCat === 'all'} onClick={() => setFilterCat('all')} />
                <Chip label="Technical" tone="accent" active={filterCat === 'technical'} onClick={() => setFilterCat('technical')} />
                <Chip label="Content"   tone="warn"   active={filterCat === 'content'}   onClick={() => setFilterCat('content')} />
                <Chip label="Industry"  tone="good"   active={filterCat === 'industry'}  onClick={() => setFilterCat('industry')} />
            </div>

            <div className="space-y-2">
                <SectionTitle title="Action queue" hint="sorted by impact" />
                {sorted.length === 0 ? (
                    <Card>
                        <div className="text-[11px] text-[#666] text-center py-4">No actions yet. Run Strategic Audit to populate.</div>
                    </Card>
                ) : sorted.map((group) => {
                    const meta = CATEGORY_META[group.category];
                    const Icon = meta.Icon;
                    const isActiveFilter = (group.category === 'technical' && wqaFilter.technicalAction === group.action)
                        || (group.category === 'content' && wqaFilter.contentAction === group.action);

                    return (
                        <Card key={`${group.category}:${group.action}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon size={11} className={meta.tone === 'accent' ? 'text-[#F5364E]' : meta.tone === 'warn' ? 'text-orange-400' : 'text-green-400'} />
                                        <Chip label={meta.label} tone={meta.tone} />
                                        <Chip label={`Effort: ${group.effort}`} tone="neutral" />
                                    </div>
                                    <div className="text-[12px] font-bold text-white truncate">{group.action}</div>
                                    {group.reason && <div className="text-[10px] text-[#777] mt-0.5 line-clamp-2">{group.reason}</div>}
                                </div>
                                <button
                                    onClick={() => {
                                        if (group.category === 'technical') setWqaFilter({ ...wqaFilter, technicalAction: isActiveFilter ? 'all' : group.action });
                                        else if (group.category === 'content') setWqaFilter({ ...wqaFilter, contentAction: isActiveFilter ? 'all' : group.action });
                                    }}
                                    title="Filter grid to this action"
                                    className="text-[#888] hover:text-white p-1 rounded hover:bg-[#1a1a1a] transition-colors shrink-0"
                                >
                                    <ArrowUpRight size={12} />
                                </button>
                            </div>

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

                            {group.pages.slice(0, 3).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[#1a1a1a] space-y-0.5">
                                    {group.pages.slice(0, 3).map((p) => {
                                        const target = (pages || []).find((pp) => pp.url === p.url);
                                        return (
                                            <button
                                                key={p.url}
                                                onClick={() => target && setSelectedPage(target)}
                                                className="w-full text-left hover:bg-[#111] rounded px-1 -mx-1 py-0.5 transition-colors"
                                                title={p.url}
                                            >
                                                <div className="text-[10px] font-mono text-blue-400 truncate">{p.pagePath || p.url}</div>
                                                <div className="text-[9px] text-[#666]">{fmtInt(p.impressions)} impr · pos {p.position?.toFixed(1) || '—'}</div>
                                            </button>
                                        );
                                    })}
                                    {group.pageCount > 3 && (
                                        <div className="text-[9px] text-[#555] text-center pt-0.5">+{group.pageCount - 3} more</div>
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
