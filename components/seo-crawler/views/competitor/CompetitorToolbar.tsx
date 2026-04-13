import { useState } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { useCrawlerUI } from '../../../../contexts/CrawlerUIContext';
import { exportMatrixCSV, downloadCSV } from '../../../../services/CompetitorMatrixExport';
import {
  LayoutGrid, BarChart3, Crosshair, Clock, FileText,
  Plus, RefreshCw, Download, Loader2, MoreVertical, FileDown
} from 'lucide-react';
import type { CompetitiveViewMode } from '../../../../contexts/SeoCrawlerContext';
import AddCompetitorModal from './AddCompetitorModal';
import CompetitorContextMenu from './CompetitorContextMenu';
import { exportCompetitivePDF } from '../../../../services/ExportService';

const VIEWS: { id: CompetitiveViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'matrix',      label: 'Matrix',      icon: <LayoutGrid size={14} /> },
  { id: 'charts',      label: 'Charts',      icon: <BarChart3 size={14} /> },
  { id: 'battlefield', label: 'Battlefield', icon: <Crosshair size={14} /> },
  { id: 'timeline',    label: 'Timeline',    icon: <Clock size={14} /> },
  { id: 'brief',       label: 'AI Brief',    icon: <FileText size={14} /> },
];

export default function CompetitorToolbar() {
  const {
    competitiveViewMode, setCompetitiveViewMode,
    showAddCompetitorInput, setShowAddCompetitorInput,
    refreshAllCompetitors, crawlingCompetitorDomain,
    competitiveState, setCompetitiveState
  } = useSeoCrawler();

  const [contextMenuDomain, setContextMenuDomain] = useState<string | null>(null);

  const toggleCompetitorActive = (domain: string) => {
    setCompetitiveState(prev => {
      const active = prev.activeCompetitorDomains.includes(domain)
        ? prev.activeCompetitorDomains.filter(d => d !== domain)
        : [...prev.activeCompetitorDomains, domain];
      return { ...prev, activeCompetitorDomains: active };
    });
  };

  const handleExportPDF = () => {
    const comps = [...competitiveState.competitorProfiles.values()];
    const blob = exportCompetitivePDF(
      competitiveState.ownProfile!,
      comps,
      competitiveState.brief
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `headlight_competitive_report_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const comps = [...competitiveState.competitorProfiles.values()]
      .filter(p => competitiveState.activeCompetitorDomains.includes(p.domain));
    const csv = exportMatrixCSV(competitiveState.ownProfile, comps);
    downloadCSV(csv, `headlight_competitive_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="h-[48px] flex items-center justify-between px-4 border-b border-[#1a1a1e] bg-[#0d0d0f]">
      {/* Left: View Switcher */}
      <div className="flex items-center gap-1 bg-[#111] rounded-lg p-0.5 border border-[#222]">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setCompetitiveViewMode(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all
              ${competitiveViewMode === v.id
                ? 'bg-[#F5364E]/10 text-[#F5364E] shadow-[inset_0_0_0_1px_rgba(245,54,78,0.22)]'
                : 'text-[#888] hover:bg-[#1a1a1e] hover:text-[#ccc]'
              }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Competitor pills */}
        <div className="flex items-center gap-1.5 mr-2 overflow-x-auto no-scrollbar max-w-[400px]">
          {competitiveState.ownProfile && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#F5364E]/15 border border-[#F5364E]/30 px-3 py-1 text-[10px] font-bold text-[#F5364E] whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5364E]" />
              Your Site
            </div>
          )}
          {[...competitiveState.competitorProfiles.entries()].map(([domain, profile]) => {
            const isActive = competitiveState.activeCompetitorDomains.includes(domain);
            return (
              <div key={domain} className="relative group flex items-center">
                <button
                  onClick={() => toggleCompetitorActive(domain)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-[#1a1a2e] border-[#333] text-white'
                      : 'bg-[#111] border-[#222] text-[#666] opacity-60'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? (crawlingCompetitorDomain === domain ? 'bg-yellow-400' : 'bg-blue-400') : 'bg-[#444]'}`} />
                  {domain}
                  {crawlingCompetitorDomain === domain && (
                    <Loader2 size={10} className="animate-spin ml-1" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setContextMenuDomain(domain); }}
                  className="ml-1 hidden group-hover:flex w-5 h-5 rounded-full bg-[#222] border border-[#333] items-center justify-center hover:bg-[#333] transition"
                >
                  <MoreVertical size={10} className="text-[#888]" />
                </button>

                {contextMenuDomain === domain && (
                  <div className="absolute top-full left-0 mt-2">
                    <CompetitorContextMenu 
                      domain={domain} 
                      onClose={() => setContextMenuDomain(null)} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddCompetitorInput(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#888] hover:text-white hover:bg-[#1a1a1e] border border-[#222] transition-all"
        >
          <Plus size={12} /> Add
        </button>

        <button
          onClick={refreshAllCompetitors}
          disabled={!!crawlingCompetitorDomain}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#888] hover:text-white hover:bg-[#1a1a1e] border border-[#222] transition-all disabled:opacity-40"
        >
          <RefreshCw size={12} className={crawlingCompetitorDomain ? 'animate-spin' : ''} /> Re-crawl
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#888] hover:text-white hover:bg-[#1a1a1e] border border-[#222] transition-all"
          title="Export as CSV"
        >
          <Download size={12} /> CSV
        </button>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white bg-[#F5364E]/20 hover:bg-[#F5364E]/30 border border-[#F5364E]/30 transition-all"
        >
          <FileDown size={12} /> PDF Report
        </button>

        <AddCompetitorModal 
          isOpen={showAddCompetitorInput} 
          onClose={() => setShowAddCompetitorInput(false)} 
        />
      </div>
    </div>
  );
}
