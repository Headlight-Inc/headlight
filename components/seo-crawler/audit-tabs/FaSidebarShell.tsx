import React from 'react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import { FaSidebarTab } from '../../../contexts/SeoCrawlerContext';

const TABS: Array<{ id: FaSidebarTab; label: string }> = [
    { id: 'fa_overview', label: 'Overview' },
    { id: 'fa_issues', label: 'Issues' },
    { id: 'fa_scores', label: 'Scores' },
    { id: 'fa_crawl', label: 'Crawl' },
    { id: 'fa_integrations', label: 'Integrations' },
];

export default function FaSidebarShell({ children }: { children: React.ReactNode }) {
    const { 
        faSidebarTab, 
        setFaSidebarTab, 
        auditSidebarWidth, 
        setAuditSidebarWidth 
    } = useSeoCrawler() as any;

    return (
        <div className="h-full flex flex-col select-none overflow-hidden">
            {/* Header / Tabs */}
            <nav className="flex items-center border-b border-[#222] bg-[#0a0a0a] sticky top-0 z-10 shrink-0 overflow-x-auto custom-scrollbar-hidden">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFaSidebarTab(tab.id)}
                        className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                            faSidebarTab === tab.id
                                ? 'border-[#F5364E] text-white'
                                : 'border-transparent text-[#555] hover:text-[#888]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-3">
                {children}
            </div>
        </div>
    );
}
