import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, FileText, Briefcase } from 'lucide-react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import PagePreviewRow from './shared/PagePreviewRow';
import ImpactBar      from './shared/ImpactBar';
import EmptyViewState from './shared/EmptyViewState';

type Cat = 'technical' | 'content' | 'industry';

const COLUMNS: Array<{ id: Cat; label: string; icon: React.ElementType; tint: string }> = [
    { id: 'technical', label: 'Technical actions', icon: Wrench,    tint: 'border-red-500/30 bg-red-500/5' },
    { id: 'content',   label: 'Content actions',   icon: FileText,  tint: 'border-blue-500/30 bg-blue-500/5' },
    { id: 'industry',  label: 'Industry actions',  icon: Briefcase, tint: 'border-purple-500/30 bg-purple-500/5' },
];

export default function WqaActionsView() {
    const { wqaState, setWqaFilter, wqaFilter } = useSeoCrawler();
    const groups = wqaState.actionGroups;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const byCategory = useMemo(() => {
        const out: Record<Cat, typeof groups> = { technical: [], content: [], industry: [] };
        for (const g of groups) {
            if (g.category in out) {
                out[g.category as Cat].push(g);
            }
        }
        (Object.keys(out) as Cat[]).forEach((k) => {
            out[k].sort((a, b) => b.impact - a.impact);
        });
        return out;
    }, [groups]);

    const maxImpact = Math.max(1, ...groups.map((g) => g.impact));

    if (groups.length === 0) {
        return <EmptyViewState
            title="No actions assigned yet"
            subtitle="Run Strategic Audit to let Headlight pick a technical and content action for every page."
        />;
    }

    return (
        <div className="flex-1 overflow-auto custom-scrollbar bg-[#070707] p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {COLUMNS.map(({ id, label, icon: Icon, tint }) => {
                    const list = byCategory[id];
                    return (
                        <div key={id} className={`rounded-lg border ${tint} flex flex-col overflow-hidden`}>
                            <div className="px-3 py-2.5 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Icon size={12} className="text-[#888]" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">{label}</span>
                                </div>
                                <span className="text-[10px] text-[#666] font-mono">{list.length} actions · {list.reduce((s, g) => s + g.count, 0)} pages</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {list.map((g) => {
                                    const key = `${g.category}:${g.action}`;
                                    const isOpen = expanded[key];
                                    return (
                                        <div key={key} className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                                                className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-[#111] transition-colors text-left"
                                            >
                                                {isOpen ? <ChevronDown size={12} className="text-[#666]" /> : <ChevronRight size={12} className="text-[#666]" />}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[12px] text-white truncate">{g.action}</div>
                                                    {g.reason && <div className="text-[10px] text-[#666] truncate">{g.reason}</div>}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-[11px] font-mono text-white">{g.count}</div>
                                                    <div className="text-[9px] text-[#555]">pages</div>
                                                </div>
                                            </button>

                                            <div className="px-3 pb-2">
                                                <ImpactBar value={g.impact} max={maxImpact} color={
                                                    id === 'technical' ? '#ef4444' :
                                                    id === 'content'   ? '#3b82f6' : '#a855f7'
                                                } />
                                                <div className="flex items-center justify-between mt-1 text-[9px] text-[#666]">
                                                    <span>Est impact {Math.round(g.impact).toLocaleString()}</span>
                                                    <button
                                                        onClick={() => setWqaFilter({
                                                            ...wqaFilter,
                                                            ...(id === 'technical' ? { technicalAction: g.action } : {}),
                                                            ...(id === 'content'   ? { contentAction: g.action }   : {}),
                                                        })}
                                                        className="text-[#888] hover:text-white"
                                                    >
                                                        Filter grid →
                                                    </button>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="border-t border-[#222] p-2 space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                                                    {g.pages.slice(0, 50).map((p: any) => (
                                                        <PagePreviewRow key={p.url} page={p} />
                                                    ))}
                                                    {g.pages.length > 50 && (
                                                        <div className="text-[10px] text-[#666] text-center py-1">+{g.pages.length - 50} more pages (filter grid to see all)</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {list.length === 0 && <div className="text-[11px] text-[#666] text-center py-8">No {label.toLowerCase()}.</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
