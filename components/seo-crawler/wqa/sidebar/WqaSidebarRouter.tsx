import React, { useEffect, useMemo } from 'react';
import { LayoutDashboard, ListChecks, Search, FileText, Wrench } from 'lucide-react';
import { useSeoCrawler, type WqaSidebarTab } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSiteStats, computeWqaActionGroups } from '../../../../services/WqaSidebarData';
import WqaOverviewTab from './WqaOverviewTab';
import WqaActionsTab from './WqaActionsTab';
import WqaSearchTab from './WqaSearchTab';
import WqaContentTab from './WqaContentTab';
import WqaTechTab from './WqaTechTab';
import TabBadge from './TabBadge';
import { WQA_SIDEBAR_TOKENS as T, WQA_SIDEBAR_LAYOUT as L } from './tokens';

type TabDef = {
    id: WqaSidebarTab;
    label: string;
    Icon: React.ElementType;
    shortcut: string;
};

const TABS: TabDef[] = [
    { id: 'wqa_overview', label: 'Overview', Icon: LayoutDashboard, shortcut: '1' },
    { id: 'wqa_actions',  label: 'Actions',  Icon: ListChecks,       shortcut: '2' },
    { id: 'wqa_search',   label: 'Search',   Icon: Search,           shortcut: '3' },
    { id: 'wqa_content',  label: 'Content',  Icon: FileText,         shortcut: '4' },
    { id: 'wqa_tech',     label: 'Tech',     Icon: Wrench,           shortcut: '5' },
];

export default function WqaSidebarRouter({ embedded = false }: { embedded?: boolean }) {
    const {
        pages, wqaState, wqaSidebarTab, setWqaSidebarTab,
        auditSidebarWidth, setIsDraggingSidebar,
    } = useSeoCrawler();

    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';
    const stats   = useMemo(() => computeWqaSiteStats(pages || [], industry as any), [pages, industry]);
    const actions = useMemo(() => computeWqaActionGroups(pages || []), [pages]);

    // Per-tab badge counts — derived, not stored.
    const badges: Record<WqaSidebarTab, { count: number; tone: 'warn' | 'bad' | 'accent' | 'neutral' }> = {
        wqa_overview: { count: 0, tone: 'neutral' },
        wqa_actions:  { count: actions.length, tone: actions.length ? 'accent' : 'neutral' },
        wqa_search:   { count: stats.pagesLosingTraffic, tone: stats.pagesLosingTraffic ? 'bad' : 'neutral' },
        wqa_content:  { count: stats.decayRiskCount, tone: stats.decayRiskCount ? 'warn' : 'neutral' },
        wqa_tech:     { count: Math.round((stats.brokenRate / 100) * stats.totalPages),
                        tone: stats.brokenRate > 0 ? 'bad' : 'neutral' },
    };

    // Keyboard: Alt + 1..5 switches tabs.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!e.altKey || e.metaKey || e.ctrlKey) return;
            const t = TABS.find((x) => x.shortcut === e.key);
            if (t) { e.preventDefault(); setWqaSidebarTab(t.id); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setWqaSidebarTab]);

    const Body = (() => {
        switch (wqaSidebarTab) {
            case 'wqa_actions':  return <WqaActionsTab />;
            case 'wqa_search':   return <WqaSearchTab />;
            case 'wqa_content':  return <WqaContentTab />;
            case 'wqa_tech':     return <WqaTechTab />;
            case 'wqa_overview':
            default:             return <WqaOverviewTab />;
        }
    })();

    return (
        <aside
            style={embedded ? undefined : { width: auditSidebarWidth, background: T.surface, borderColor: T.border }}
            className={`h-full flex flex-col border-l relative ${embedded ? 'w-full' : 'shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.2)]'}`}
        >
            {!embedded && (
                <div
                    onMouseDown={() => setIsDraggingSidebar(true)}
                    className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize z-50 transition-colors hover:bg-[#F5364E]"
                />
            )}
            <nav
                style={{ height: L.tabBarHeight, background: T.surfaceAlt, borderColor: T.border }}
                className="shrink-0 flex items-stretch border-b overflow-x-auto custom-scrollbar-hidden"
            >
                {TABS.map(({ id, label, Icon, shortcut }) => {
                    const active = wqaSidebarTab === id;
                    const b = badges[id];
                    return (
                        <button
                            key={id}
                            onClick={() => setWqaSidebarTab(id)}
                            title={`${label} (Alt+${shortcut})`}
                            className={`shrink-0 px-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold border-r transition-colors ${
                                active
                                    ? 'bg-[#0a0a0a] text-white border-t-2 border-t-[#F5364E] -mt-[1px]'
                                    : 'text-[#777] hover:text-[#ccc] hover:bg-[#111]'
                            }`}
                            style={{ borderRightColor: T.border }}
                        >
                            <Icon size={12} />
                            <span>{label}</span>
                            <TabBadge count={b.count} tone={b.tone} />
                        </button>
                    );
                })}
            </nav>
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: L.bodyPad }}>
                {Body}
            </div>
        </aside>
    );
}
