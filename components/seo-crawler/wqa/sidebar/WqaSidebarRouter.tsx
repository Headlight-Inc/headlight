import React from 'react';
import { LayoutDashboard, ListChecks, Search, FileText, Wrench } from 'lucide-react';
import { useSeoCrawler, type WqaSidebarTab } from '../../../../contexts/SeoCrawlerContext';
import { getMode, registerAllModes } from '../../../../packages/modes/src';
import WqaOverviewTab from './WqaOverviewTab';
import WqaActionsTab from './WqaActionsTab';
import WqaSearchTab from './WqaSearchTab';
import WqaContentTab from './WqaContentTab';
import WqaTechTab from './WqaTechTab';

const DEFAULT_TABS: Array<{ id: WqaSidebarTab; label: string; Icon: React.ElementType }> = [
    { id: 'wqa_overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'wqa_actions',  label: 'Actions',  Icon: ListChecks },
    { id: 'wqa_search',   label: 'Search',   Icon: Search },
    { id: 'wqa_content',  label: 'Content',  Icon: FileText },
    { id: 'wqa_tech',     label: 'Tech',     Icon: Wrench },
];

registerAllModes();

export default function WqaSidebarRouter({ embedded = false }: { embedded?: boolean }) {
    const { mode, wqaSidebarTab, setWqaSidebarTab, auditSidebarWidth, setIsDraggingSidebar } = useSeoCrawler();

    const tabs = React.useMemo(() => {
        try {
            const modeTabs = getMode(mode).rsTabs;
            if (!modeTabs.length) return DEFAULT_TABS;
            return modeTabs.map((tab) => {
                const normalized = tab.id.toLowerCase();
                if (normalized.includes('action')) return { id: 'wqa_actions' as WqaSidebarTab, label: tab.label, Icon: ListChecks };
                if (normalized.includes('search')) return { id: 'wqa_search' as WqaSidebarTab, label: tab.label, Icon: Search };
                if (normalized.includes('content')) return { id: 'wqa_content' as WqaSidebarTab, label: tab.label, Icon: FileText };
                if (normalized.includes('tech')) return { id: 'wqa_tech' as WqaSidebarTab, label: tab.label, Icon: Wrench };
                return { id: 'wqa_overview' as WqaSidebarTab, label: tab.label, Icon: LayoutDashboard };
            });
        } catch {
            return DEFAULT_TABS;
        }
    }, [mode]);

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
            style={embedded ? undefined : { width: auditSidebarWidth }}
            className={`h-full flex flex-col bg-[#0a0a0a] border-l border-[#1a1a1a] relative ${embedded ? 'w-full h-full' : 'shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.2)]'}`}
        >
            {!embedded && (
                <div 
                    onMouseDown={() => setIsDraggingSidebar(true)}
                    className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize z-50 transition-colors hover:bg-[#F5364E]"
                ></div>
            )}
            <nav className="shrink-0 h-[38px] flex items-stretch border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-x-auto custom-scrollbar-hidden">
                {tabs.map(({ id, label, Icon }) => {
                    const active = wqaSidebarTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setWqaSidebarTab(id)}
                            className={`shrink-0 px-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold border-r border-[#1a1a1a] last:border-r-0 transition-colors ${
                                active
                                    ? 'bg-[#0a0a0a] text-white border-t-2 border-t-[#F5364E] -mt-[1px]'
                                    : 'text-[#777] hover:text-[#ccc] hover:bg-[#111]'
                            }`}
                            title={label}
                        >
                            <Icon size={12} />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {Body}
            </div>
        </aside>
    );
}
