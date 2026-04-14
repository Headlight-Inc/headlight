import React, { useCallback, useMemo, useState } from 'react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import WQASubheader from './WQASubheader';
import WQACategoryTree from './WQACategoryTree';
import WQARightSidebar from './WQARightSidebar';
import WQAInspector from './WQAInspector';
import WQADashboardView from './WQADashboardView';
import WQAPrioritiesView from './WQAPrioritiesView';
import { getEffectiveIndustry, getEffectiveLanguage, type WqaViewMode } from '../../../services/WebsiteQualityModeTypes';
import { computeWqaActionGroups, computeWqaSiteStats } from '../../../services/WqaSidebarData';
import type { DetectedIndustry } from '../../../services/SiteTypeDetector';

interface WQAModeRouterProps {
  gridView: React.ReactNode;
}

export default function WQAModeRouter({ gridView }: WQAModeRouterProps) {
  const {
    wqaState,
    setWqaState,
    pages,
    filteredPages,
    selectedPage,
    setSelectedPage,
    urlInput,
    isCrawling,
    crawlHistory,
    currentSessionId,
    aiNarrative,
    handleStartPause,
    setShowComparisonView,
    setShowExportDialog,
    addLog,
  } = useSeoCrawler();

  const industry = getEffectiveIndustry(wqaState);
  const language = getEffectiveLanguage(wqaState);

  const stats = useMemo(() => {
    if (wqaState.siteStats) return wqaState.siteStats;
    if (pages.length === 0) return null;
    return computeWqaSiteStats(pages, industry);
  }, [wqaState.siteStats, pages, industry]);

  const actionGroups = useMemo(() => {
    if (wqaState.actionGroups.length > 0) return wqaState.actionGroups;
    return computeWqaActionGroups(pages);
  }, [wqaState.actionGroups, pages]);

  const lastCrawlTime = useMemo(() => {
    if (!currentSessionId || crawlHistory.length === 0) return null;
    const session = crawlHistory.find((s) => s.id === currentSessionId);
    if (!session?.completedAt) return null;
    const completedAt = Number(session.completedAt);
    if (!Number.isFinite(completedAt) || completedAt <= 0) return null;
    const d = new Date(completedAt);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 60) return `${Math.max(0, diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  }, [currentSessionId, crawlHistory]);

  const handleViewChange = useCallback((view: WqaViewMode) => {
    setWqaState((prev) => ({ ...prev, viewMode: view }));
  }, [setWqaState]);

  const handleIndustryOverride = useCallback((ind: DetectedIndustry | null) => {
    setWqaState((prev) => ({ ...prev, industryOverride: ind }));
  }, [setWqaState]);

  const handleLanguageOverride = useCallback((lang: string | null) => {
    setWqaState((prev) => ({ ...prev, languageOverride: lang }));
  }, [setWqaState]);

  const handleFilterByAction = useCallback((action: string) => {
    setWqaState((prev) => ({ ...prev, viewMode: 'grid' }));
    addLog(`Filtering WQA pages for action: ${action}`, 'info', { source: 'system' });
  }, [addLog, setWqaState]);

  const handleSelectPage = useCallback((url: string) => {
    const page = pages.find((p: any) => p.url === url);
    if (page) setSelectedPage(page);
  }, [pages, setSelectedPage]);

  const [categoryFilter, setCategoryFilter] = useState<{
    groupId: string;
    nodeId: string;
    fn: ((page: any) => boolean) | null;
  } | null>(null);

  const displayPages = useMemo(() => {
    if (!categoryFilter?.fn) return filteredPages;
    return filteredPages.filter(categoryFilter.fn);
  }, [filteredPages, categoryFilter]);

  return (
    <>
      <WQASubheader
        wqaState={wqaState}
        urlInput={urlInput}
        isCrawling={isCrawling}
        lastCrawlTime={lastCrawlTime}
        activeView={wqaState.viewMode}
        onViewChange={handleViewChange}
        onIndustryOverride={handleIndustryOverride}
        onLanguageOverride={handleLanguageOverride}
        onReCrawl={() => handleStartPause(true)}
        onCompare={() => setShowComparisonView(true)}
        onExport={() => setShowExportDialog(true)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-[220px] min-w-[180px] max-w-[320px] shrink-0 overflow-hidden border-r border-[#222]">
          <WQACategoryTree
            pages={pages}
            industry={industry}
            activeFilter={categoryFilter ? { groupId: categoryFilter.groupId, nodeId: categoryFilter.nodeId } : null}
            onFilterChange={(groupId, nodeId, filter) => setCategoryFilter({ groupId, nodeId, fn: filter })}
            onClearFilter={() => setCategoryFilter(null)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {wqaState.viewMode === 'grid' && gridView}
            {wqaState.viewMode === 'dashboard' && (
              <div className="custom-scrollbar h-full overflow-y-auto">
                <WQADashboardView
                  wqaState={wqaState}
                  pages={pages}
                  stats={stats}
                  actionGroups={actionGroups}
                  aiNarrative={aiNarrative}
                  onFilterByCategory={(_category) => setWqaState((prev) => ({ ...prev, viewMode: 'grid' }))}
                  onFilterByAction={handleFilterByAction}
                  onNavigateToGrid={() => setWqaState((prev) => ({ ...prev, viewMode: 'grid' }))}
                />
              </div>
            )}
            {wqaState.viewMode === 'priorities' && (
              <div className="custom-scrollbar h-full overflow-y-auto">
                <WQAPrioritiesView
                  wqaState={wqaState}
                  pages={pages}
                  stats={stats}
                  actionGroups={actionGroups}
                  onSelectPage={handleSelectPage}
                  onFilterByAction={handleFilterByAction}
                  onRunAIWrite={(urls) => addLog(`AI write requested for ${urls.length} pages`, 'info', { source: 'system' })}
                  onCreateTasks={(action, urls) => addLog(`Task creation requested for ${action} (${urls.length})`, 'info', { source: 'system' })}
                  onExportGroup={() => setShowExportDialog(true)}
                />
              </div>
            )}
          </div>

          {selectedPage && (
            <div className="h-[250px] min-h-[150px] max-h-[50vh] shrink-0 border-t border-[#222]">
              <WQAInspector
                page={selectedPage}
                industry={industry}
                language={language}
                onClose={() => setSelectedPage(null)}
                onAssign={(url) => addLog(`Assign requested for ${url}`, 'info', { source: 'system' })}
                onComment={(url) => addLog(`Comment requested for ${url}`, 'info', { source: 'system' })}
                onOpenExternal={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
              />
            </div>
          )}
        </div>

        <div className="w-[320px] min-w-[280px] max-w-[480px] shrink-0 overflow-hidden border-l border-[#222]">
          <WQARightSidebar
            wqaState={wqaState}
            pages={pages}
            filteredPages={displayPages}
            crawlHistory={crawlHistory}
            currentSessionId={currentSessionId}
            aiNarrative={aiNarrative}
            onCompare={(_id1, _id2) => setShowComparisonView(true)}
            onFilterByAction={handleFilterByAction}
            onNavigateToPriorities={() => setWqaState((prev) => ({ ...prev, viewMode: 'priorities' }))}
          />
        </div>
      </div>
    </>
  );
}
