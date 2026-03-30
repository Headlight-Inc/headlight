import React from 'react';
import { Search, ChevronDown, ChevronRight, Wand2, ArrowUpDown } from 'lucide-react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';
import { CATEGORIES, SMART_PRESETS } from './constants';

export default function SiteExplorer() {
    const {
        categorySearch, setCategorySearch,
        leftSidebarPreset, setLeftSidebarPreset,
        leftSidebarWidth, setIsDraggingLeftSidebar,
        openCategories, setOpenCategories,
        setVisibleColumns, setActiveMacro,
        dynamicClusters, categoryCounts,
        pages, toggleCategory,
        activeCategory, setActiveCategory,
        prioritizedCategories, prioritizeByIssues, setPrioritizeByIssues,
        stats
    } = useSeoCrawler();

    return (
        <aside style={{ width: leftSidebarWidth }} className="border-r border-[#222] bg-[#111] flex flex-col shrink-0 overflow-hidden relative">
            <div
                onMouseDown={() => setIsDraggingLeftSidebar(true)}
                className="absolute top-0 bottom-0 right-0 w-1.5 -mr-0.5 cursor-ew-resize z-50 transition-colors hover:bg-[#F5364E]"
            ></div>
            {/* Sidebar Search */}
            <div className="px-2 pt-2 pb-1 shrink-0 border-b border-[#1a1a1a]">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" size={11} />
                    <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full bg-[#0a0a0a] border border-[#222] rounded pl-6 pr-2 py-1 text-[11px] text-[#e0e0e0] placeholder-[#555] focus:border-[#F5364E] focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Smart Presets */}
            <div className="px-2 py-1.5 border-b border-[#1a1a1a] shrink-0">
                <div className="flex items-center justify-between mb-1 px-1">
                    <div className="text-[9px] text-[#555] uppercase tracking-widest font-bold">Quick Presets</div>
                    {/* AI priority toggle */}
                    <button
                        onClick={() => setPrioritizeByIssues(!prioritizeByIssues)}
                        title={prioritizeByIssues ? "Categories sorted by issue count" : "Categories in default order"}
                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors ${
                            prioritizeByIssues ? 'bg-[#F5364E]/15 text-[#F5364E]' : 'text-[#555] hover:text-[#888]'
                        }`}
                    >
                        Sort by Issues
                    </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar-hidden whitespace-nowrap pb-1">
                    {SMART_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => {
                                if (leftSidebarPreset === preset.id) {
                                    setLeftSidebarPreset(null);
                                    setOpenCategories(CATEGORIES.map(c => c.id));
                                } else {
                                    setLeftSidebarPreset(preset.id);
                                    setOpenCategories(preset.categories);
                                    setVisibleColumns(preset.columns);
                                    setActiveMacro(null);
                                }
                            }}
                            title={preset.desc}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all shrink-0 ${
                                leftSidebarPreset === preset.id
                                    ? 'bg-[#F5364E]/15 text-[#F5364E] border border-[#F5364E]/30 shadow-[0_0_10px_rgba(245,54,78,0.1)]'
                                    : 'bg-[#1a1a1a] text-[#888] border border-[#222] hover:border-[#444] hover:text-[#ccc]'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>


            {/* Category Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-1 px-1">
                {(() => {
                    // Use prioritized categories when smart sort is on
                    const baseCats = prioritizeByIssues && pages.length > 0 ? prioritizedCategories : CATEGORIES;
                    const allCats = [
                        ...baseCats,
                        ...(dynamicClusters.length > 0 ? [{ id: 'ai-clusters', label: 'AI Topic Clusters', icon: <Wand2 size={14}/>, sub: ['All', ...dynamicClusters] }] : [])
                    ];
                    const filtered = categorySearch
                        ? allCats.filter(c =>
                            c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                            c.sub.some((s: string) => s.toLowerCase().includes(categorySearch.toLowerCase()))
                        )
                        : allCats;

                    return filtered.map(category => {
                        const isOpen = openCategories.includes(category.id);
                        const catCounts = (categoryCounts[category.id] || {}) as Record<string, number>;
                        const totalCatCount = (Object.values(catCounts) as number[]).reduce((a, b) => a + b, 0);
                        const hasProblems = category.id !== 'internal' && category.id !== 'ai-clusters' && totalCatCount > 0 && pages.length > 0;

                        // Filter subs
                        const visibleSubs = categorySearch
                            ? category.sub.filter((s: string) => s.toLowerCase().includes(categorySearch.toLowerCase()) || category.label.toLowerCase().includes(categorySearch.toLowerCase()))
                            : category.sub;

                        // Auto-hide empty subs
                        const displaySubs = pages.length > 0
                            ? visibleSubs.filter((s: string) => s === 'All' || (catCounts[s] || 0) > 0)
                            : visibleSubs;

                        if (displaySubs.length === 0 && pages.length > 0 && !categorySearch) return null;

                        return (
                            <div key={category.id} className="mb-0.5">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[12px] font-semibold rounded-sm transition-colors ${isOpen ? 'text-[#eee]' : 'text-[#aaa] hover:bg-[#1a1a1a]'}`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[#666] shrink-0">{category.icon}</span>
                                        <span className="truncate">{category.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {pages.length > 0 && totalCatCount > 0 && (
                                            <span className="text-[10px] font-mono text-[#555]">{totalCatCount}</span>
                                        )}
                                        {isOpen ? <ChevronDown size={12} className="text-[#555]"/> : <ChevronRight size={12} className="text-[#555]"/>}
                                    </div>
                                </button>

                                <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isOpen || categorySearch ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="ml-[18px] pl-3 my-1 space-y-0.5 border-l border-[#222]">
                                            {displaySubs.map((subItem: string) => {
                                                const isActive = activeCategory.group === category.id && activeCategory.sub === subItem;
                                                const subCount = catCounts[subItem] || 0;
                                                const isWarning = subCount > 0 && ['Missing', 'Broken', 'Missing HSTS', 'Mixed Content', 'Insecure Forms',
                                                    'Client Error (4xx)', 'Server Error (5xx)', 'Orphan Pages', 'Non-Indexable', 'Noindex',
                                                    'Slow Pages', 'Poor LCP', 'Poor CLS', 'Hreflang Errors', 'Depth 5+'].includes(subItem);
                                                return (
                                                    <button
                                                        key={subItem}
                                                        onClick={() => { setActiveCategory({ group: category.id, sub: subItem }); setActiveMacro(null); }}
                                                        className={`w-full text-left px-2.5 py-1 text-[12px] rounded-sm transition-all flex items-center justify-between gap-1 relative group ${
                                                            isActive 
                                                                ? 'bg-gradient-to-r from-[#F5364E]/10 to-transparent text-[#F5364E] font-medium' 
                                                                : 'text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]'
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute left-[-13px] top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-[#F5364E] rounded-r-sm shadow-[0_0_8px_rgba(245,54,78,0.5)]"></div>
                                                        )}
                                                        <span className="truncate">{subItem}</span>
                                                        {pages.length > 0 && (
                                                            <span className={`text-[10px] font-mono shrink-0 px-1 py-0 rounded ${
                                                                isWarning ? 'text-[#888] bg-[#222]' :
                                                                subCount > 0 ? (isActive ? 'text-[#F5364E]' : 'text-[#666]') : 'text-[#333]'
                                                            }`}>
                                                                {subCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>
        </aside>
    );
}
