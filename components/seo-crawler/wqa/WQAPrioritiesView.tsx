import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Users, Sparkles, ExternalLink } from 'lucide-react';
import type { WqaActionGroup, WqaSiteStats, WebsiteQualityState } from '../../../services/WebsiteQualityModeTypes';
import { getEffectiveIndustry } from '../../../services/WebsiteQualityModeTypes';
import type { DetectedIndustry } from '../../../services/SiteTypeDetector';

interface Props {
  wqaState: WebsiteQualityState;
  pages: any[];
  stats: WqaSiteStats | null;
  actionGroups: WqaActionGroup[];
  onSelectPage: (url: string) => void;
  onFilterByAction: (action: string) => void;
  onRunAIWrite: (urls: string[]) => void;
  onCreateTasks: (action: string, urls: string[]) => void;
  onExportGroup: (group: WqaActionGroup) => void;
}

export default function WQAPrioritiesView({
  wqaState,
  pages,
  stats,
  actionGroups,
  onSelectPage,
  onFilterByAction,
  onRunAIWrite,
  onCreateTasks,
  onExportGroup,
}: Props) {
  const industry = getEffectiveIndustry(wqaState);

  if (!stats || actionGroups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#666] text-sm bg-[#0a0a0a]">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-2">No Actions Found</h2>
          <p>Run a crawl and connect GSC/GA4 for impact-based priorities.</p>
        </div>
      </div>
    );
  }

  const sorted = useMemo(
    () => [...actionGroups]
      .filter((g) => g.totalEstimatedImpact > 0 || g.pageCount > 0)
      .sort((a, b) => b.totalEstimatedImpact - a.totalEstimatedImpact),
    [actionGroups]
  );

  const totalImpact = sorted.reduce((s, g) => s + g.totalEstimatedImpact, 0);
  const liftPct = stats.totalClicks > 0 ? Math.round((totalImpact / stats.totalClicks) * 100) : 0;

  const mainActions = sorted.filter((g) => g.category !== 'industry');
  const industryActions = sorted.filter((g) => g.category === 'industry');

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a] p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-bold text-white">
            Priorities — Estimated +{liftPct}% clicks (+{totalImpact.toLocaleString()}/mo)
          </h2>
          <p className="text-[11px] text-[#666] mt-0.5">
            {sorted.length} action groups · {sorted.reduce((s, g) => s + g.pageCount, 0)} pages total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCreateTasks('all', pages.map((p: any) => p.url))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#222] text-[11px] text-[#ccc] hover:bg-[#222] transition-colors"
          >
            <Users size={12} />
            Assign All
          </button>
          <button
            onClick={() => sorted[0] && onExportGroup(sorted[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#222] text-[11px] text-[#ccc] hover:bg-[#222] transition-colors"
          >
            <Download size={12} />
            Export Plan
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {mainActions.map((group, i) => (
          <PriorityCard
            key={`${group.category}:${group.action}`}
            index={i + 1}
            group={group}
            industry={industry}
            onSelectPage={onSelectPage}
            onFilterByAction={onFilterByAction}
            onRunAIWrite={onRunAIWrite}
            onCreateTasks={onCreateTasks}
            onExportGroup={onExportGroup}
          />
        ))}
      </div>

      {industryActions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-3">
            {formatIndustryLabel(industry)} Actions
          </h3>
          <div className="space-y-3">
            {industryActions.map((group, i) => (
              <PriorityCard
                key={`ind:${group.action}`}
                index={mainActions.length + i + 1}
                group={group}
                industry={industry}
                onSelectPage={onSelectPage}
                onFilterByAction={onFilterByAction}
                onRunAIWrite={onRunAIWrite}
                onCreateTasks={onCreateTasks}
                onExportGroup={onExportGroup}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PriorityCardProps {
  index: number;
  group: WqaActionGroup;
  industry: DetectedIndustry;
  onSelectPage: (url: string) => void;
  onFilterByAction: (action: string) => void;
  onRunAIWrite: (urls: string[]) => void;
  onCreateTasks: (action: string, urls: string[]) => void;
  onExportGroup: (group: WqaActionGroup) => void;
}

function PriorityCard({
  index,
  group,
  industry,
  onSelectPage,
  onFilterByAction,
  onRunAIWrite,
  onCreateTasks,
  onExportGroup,
}: PriorityCardProps) {
  const [expanded, setExpanded] = useState(index <= 3);
  const [showAll, setShowAll] = useState(false);

  const visiblePages = showAll ? group.pages : group.pages.slice(0, 8);
  const hasMore = group.pages.length > 8;

  const categoryColor = group.category === 'technical' ? '#6366f1' : group.category === 'content' ? '#22c55e' : '#f59e0b';
  const categoryLabel = group.category === 'technical' ? 'Technical' : group.category === 'content' ? 'Content' : 'Industry';
  const effortColors: Record<string, string> = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };

  const columns = useMemo(() => getColumnsForAction(group.action, industry), [group.action, industry]);
  const showAIWriteButton = ['Rewrite Title & Meta', 'Expand Thin Content'].includes(group.action);

  return (
    <div className="bg-[#0d0d0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#444] w-5">{index}</span>
          {expanded ? <ChevronDown size={14} className="text-[#555]" /> : <ChevronRight size={14} className="text-[#555]" />}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white">{group.action}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                style={{ color: categoryColor, borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}10` }}
              >
                {categoryLabel}
              </span>
              <span className={`text-[9px] ${effortColors[group.effort] || 'text-[#888]'}`}>
                {group.effort} effort
              </span>
            </div>
            <p className="text-[11px] text-[#666] mt-0.5 max-w-[600px] truncate">{group.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[12px] font-bold text-white">{group.pageCount} pages</div>
            {group.totalEstimatedImpact > 0 && (
              <div className="text-[10px] text-green-400">+{group.totalEstimatedImpact.toLocaleString()} clicks/mo</div>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#1a1a1a]">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[#666] border-b border-[#111]">
                  {columns.map((col) => (
                    <th key={col.key} className={`py-2 px-3 font-medium ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePages.map((page) => (
                  <tr
                    key={page.url}
                    className="border-b border-[#0a0a0a] hover:bg-[#111] cursor-pointer transition-colors"
                    onClick={() => onSelectPage(page.url)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-1.5 px-3 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.key === 'pagePath' ? 'text-[#ccc] max-w-[200px] truncate' : 'text-[#888]'}`}
                      >
                        {col.render(page)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && !showAll && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="w-full py-2 text-[11px] text-[#666] hover:text-[#aaa] border-t border-[#111] transition-colors"
            >
              Show all {group.pageCount} pages
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            {showAIWriteButton && (
              <button
                onClick={() => onRunAIWrite(group.pages.map((p) => p.url))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F5364E]/10 border border-[#F5364E]/30 text-[11px] text-[#F5364E] hover:bg-[#F5364E]/20 transition-colors"
              >
                <Sparkles size={12} />
                AI Write All {group.pageCount}
              </button>
            )}
            <button
              onClick={() => onCreateTasks(group.action, group.pages.map((p) => p.url))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#222] text-[11px] text-[#ccc] hover:bg-[#222] transition-colors"
            >
              <Users size={12} />
              Assign to Team
            </button>
            <button
              onClick={() => onFilterByAction(group.action)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#222] text-[11px] text-[#ccc] hover:bg-[#222] transition-colors"
            >
              <ExternalLink size={12} />
              View in Grid
            </button>
            <button
              onClick={() => onExportGroup(group)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#222] text-[11px] text-[#ccc] hover:bg-[#222] transition-colors"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ColumnDef {
  key: string;
  label: string;
  align: 'left' | 'right';
  render: (page: WqaActionGroup['pages'][number]) => React.ReactNode;
}

function getColumnsForAction(action: string, _industry: DetectedIndustry): ColumnDef[] {
  const pathCol: ColumnDef = { key: 'pagePath', label: 'Path', align: 'left', render: (p) => p.pagePath };
  const categoryCol: ColumnDef = { key: 'pageCategory', label: 'Category', align: 'left', render: (p) => formatCat(p.pageCategory) };
  const impressionsCol: ColumnDef = { key: 'impressions', label: 'Impressions', align: 'right', render: (p) => formatCompact(p.impressions) };
  const clicksCol: ColumnDef = { key: 'clicks', label: 'Clicks', align: 'right', render: (p) => formatCompact(p.clicks) };
  const positionCol: ColumnDef = { key: 'position', label: 'Position', align: 'right', render: (p) => (p.position > 0 ? Math.round(p.position) : '—') };
  const ctrCol: ColumnDef = { key: 'ctr', label: 'CTR', align: 'right', render: (p) => (p.ctr > 0 ? `${(p.ctr * 100).toFixed(1)}%` : '—') };
  const sessionsCol: ColumnDef = { key: 'sessions', label: 'Sessions', align: 'right', render: (p) => formatCompact(p.sessions) };
  const impactCol: ColumnDef = {
    key: 'impact',
    label: 'Est. Impact',
    align: 'right',
    render: (p) => (p.estimatedImpact > 0 ? <span className="text-green-400">+{formatCompact(p.estimatedImpact)}</span> : '—'),
  };
  const backlinksCol: ColumnDef = { key: 'backlinks', label: 'Backlinks', align: 'right', render: (p) => p.backlinks || '—' };
  const lastModifiedCol: ColumnDef = { key: 'lastModified', label: 'Last Modified', align: 'left', render: (p) => (p.lastModified ? formatDate(p.lastModified) : '—') };
  const titleCol: ColumnDef = { key: 'title', label: 'Current Title', align: 'left', render: (p) => <span className="truncate max-w-[180px] block">{p.currentTitle || '(empty)'}</span> };

  switch (action) {
    case 'Rewrite Title & Meta':
      return [pathCol, impressionsCol, ctrCol, positionCol, sessionsCol, titleCol, impactCol];
    case 'Recover Declining Content':
      return [pathCol, sessionsCol, lastModifiedCol, impressionsCol, impactCol];
    case 'Restore Broken Page':
      return [pathCol, backlinksCol, impressionsCol, impactCol];
    case 'Expand Thin Content':
    case 'Update Stale Content':
      return [pathCol, categoryCol, impressionsCol, positionCol, sessionsCol, impactCol];
    case 'Add Schema':
      return [pathCol, categoryCol, impressionsCol, clicksCol, impactCol];
    default:
      return [pathCol, categoryCol, impressionsCol, sessionsCol, impactCol];
  }
}

function formatCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatCat(cat: string): string {
  const map: Record<string, string> = {
    product: 'Product',
    blog_post: 'Blog',
    category: 'Category',
    landing_page: 'Landing',
    service_page: 'Service',
    homepage: 'Home',
    about_legal: 'About',
    faq_help: 'FAQ',
    resource: 'Resource',
    other: 'Other',
  };
  return map[cat] || cat;
}

function formatIndustryLabel(industry: DetectedIndustry): string {
  const labels: Record<string, string> = {
    ecommerce: 'E-commerce',
    news: 'News / Magazine',
    blog: 'Blog / Content',
    local: 'Local Business',
    saas: 'SaaS',
    healthcare: 'Healthcare',
    finance: 'Finance',
    education: 'Education',
    general: 'General',
  };
  return labels[industry] || 'General';
}
