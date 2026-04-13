import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Download, 
  X, 
  Info,
  ChevronDown,
  Pencil,
  ExternalLink,
  Table as TableIcon,
  Bot,
  Sparkles
} from 'lucide-react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import { useOptionalProject } from '../../../services/ProjectContext';
import { 
  COMPARISON_ROWS, 
  COMPARISON_CATEGORIES, 
  CompetitorProfile,
  createEmptyProfile
} from '../../../services/CompetitorMatrixConfig';
import { CompetitorProfileBuilder } from '../../../services/CompetitorProfileBuilder';
import { runCompetitorMicroCrawl } from '../../../services/CompetitorMicroCrawl';
import { saveCompetitorProfile, loadCompetitorProfiles } from '../../../services/CrawlDatabase';
import { getAIEngine } from '../../../services/ai';

export default function CompetitorMatrixView() {
  const { 
    ownProfile, 
    competitorProfiles, 
    setCompetitorProfiles,
    showAddCompetitorInput: showAddInput,
    setShowAddCompetitorInput: setShowAddInput,
    crawlingCompetitorDomain: crawlingDomain,
    setCrawlingCompetitorDomain: setCrawlingDomain,
    refreshAllCompetitors,
    addLog 
  } = useSeoCrawler();
  const { activeProject } = useOptionalProject();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(COMPARISON_CATEGORIES) // all expanded by default
  );
  
  const [addCompetitorInput, setAddCompetitorInput] = useState('');
  const [editingCell, setEditingCell] = useState<{ domain: string; rowId: string } | null>(null);

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    setExpandedCategories(next);
  };

  const handleAddCompetitor = async () => {
    const domain = addCompetitorInput.trim();
    if (!domain || !activeProject?.id) return;
    
    setShowAddInput(false);
    setCrawlingDomain(domain);
    setAddCompetitorInput('');
    
    addLog(`Starting micro-crawl for ${domain}...`, 'info');
    
    try {
      const ai = getAIEngine();
      const profile = await runCompetitorMicroCrawl(domain, activeProject.id, {
        maxPages: 30,
        aiEnrich: true,
        aiComplete: async (opts) => {
          const res = await ai.complete(opts.prompt, { format: 'json' });
          return { text: res.text };
        },
        onProgress: (p) => {
          // Could update progress state here if needed
        }
      });
      
      setCompetitorProfiles(prev => [...prev.filter(c => c.domain !== profile.domain), profile]);
      setCrawlingDomain(null);
      addLog(`Competitor ${domain} added successfully.`, 'success');
    } catch (err: any) {
      addLog(`Failed to add competitor: ${err.message}`, 'error');
      setCrawlingDomain(null);
    }
  };


  const handleCellEdit = async (domain: string, profileKey: string, value: any) => {
    if (!activeProject?.id) return;
    
    const profile = competitorProfiles.find(c => c.domain === domain);
    if (!profile) return;

    const updated = { ...profile, [profileKey]: value };
    await saveCompetitorProfile(activeProject.id, updated);
    setCompetitorProfiles(prev => prev.map(c => c.domain === domain ? updated : c));
    setEditingCell(null);
  };

  const visibleCategories = COMPARISON_CATEGORIES;


  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden">

      {showAddInput && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-[#222] animate-in slide-in-from-top duration-200">
          <input
            value={addCompetitorInput}
            onChange={e => setAddCompetitorInput(e.target.value)}
            placeholder="competitor.com"
            className="flex-1 max-w-xs h-9 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 text-[12px] text-white focus:border-[#F5364E] focus:outline-none"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAddCompetitor()}
          />
          <button onClick={handleAddCompetitor} className="h-9 px-4 bg-[#F5364E] text-white text-[11px] font-bold rounded-lg shadow-lg shadow-[#F5364E]/10">
            Crawl & Add
          </button>
          <button onClick={() => setShowAddInput(false)} className="h-9 px-3 text-[#666] hover:text-white text-[11px] font-medium transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* Main Matrix Surface */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0a0a0a]">
        <div className="inline-block min-w-full">
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222]">
            <div className="flex">
              <div className="w-[280px] shrink-0 sticky left-0 bg-[#0a0a0a] z-30 px-4 py-4 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Category / Metric</span>
              </div>
              
              {/* Our Site column */}
              <div className="w-[220px] shrink-0 px-4 py-4 border-l border-[#1a1a1a] bg-[#0d0d0d]/50">
                <div className="text-[10px] font-black text-[#F5364E] uppercase tracking-tighter mb-0.5">Your Domain</div>
                <div className="text-[12px] font-bold text-white truncate">{ownProfile?.domain || 'Current Site'}</div>
              </div>
              
              {/* Competitor columns */}
              {competitorProfiles.map(comp => (
                <div key={comp.domain} className="w-[220px] shrink-0 px-4 py-4 border-l border-[#1a1a1a] group">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[10px] font-black text-[#aaa] uppercase tracking-tighter">Competitor</div>
                    <button 
                      onClick={() => {/* remove */}}
                      className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-400 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="text-[12px] font-bold text-white truncate">{comp.businessName || comp.domain}</div>
                </div>
              ))}

              {/* Crawling Placeholder */}
              {crawlingDomain && (
                <div className="w-[220px] shrink-0 px-4 py-4 border-l border-[#1a1a1a] bg-red-500/5 animate-pulse">
                   <div className="flex items-center gap-2 text-[#F5364E]">
                     <RefreshCw size={14} className="animate-spin" />
                     <span className="text-[11px] font-bold">Crawling...</span>
                   </div>
                   <div className="text-[10px] text-red-400/60 truncate mt-1">{crawlingDomain}</div>
                </div>
              )}
            </div>
          </div>

          {/* Category Sections */}
          {visibleCategories.map(category => (
            <div key={category} className="border-b border-[#1a1a1a]">
              {/* Category Header */}
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center px-4 py-2 bg-[#111]/40 hover:bg-[#111] group transition-colors"
              >
                <ChevronDown 
                  size={14} 
                  className={`text-[#444] transition-transform duration-200 ${expandedCategories.has(category) ? '' : '-rotate-90'}`} 
                />
                <span className="ml-2 text-[11px] font-black text-[#666] uppercase tracking-widest">{category}</span>
                <div className="flex-1 h-px bg-[#1a1a1a] ml-4" />
              </button>

              {/* Rows */}
              {expandedCategories.has(category) && (
                <div className="divide-y divide-[#131313]">
                  {COMPARISON_ROWS.filter(r => r.category === category).map(row => (
                    <div key={row.id} className="flex hover:bg-[#111]/30 group/row transition-colors h-10 items-center">
                      <div className="w-[280px] shrink-0 sticky left-0 bg-[#0a0a0a] z-10 px-4 py-2 flex items-center justify-between group-hover:bg-[#111] transition-colors border-r border-[#1a1a1a]">
                        <span className="text-[11px] text-[#aaa] font-medium">{row.label}</span>
                      </div>

                      {/* Our Value Cell */}
                      <div className="w-[220px] shrink-0 border-l border-[#1a1a1a] bg-[#0d0d0d]/30">
                        <ComparisonCell 
                          value={ownProfile ? (ownProfile as any)[row.profileKey] : null} 
                          format={row.format} 
                          isOwnSite 
                        />
                      </div>

                      {/* Competitor Cells */}
                      {competitorProfiles.map(comp => (
                        <div key={comp.domain} className="w-[220px] shrink-0 border-l border-[#1a1a1a] relative group/cell">
                          <ComparisonCell 
                            value={(comp as any)[row.profileKey]} 
                            ownValue={ownProfile ? (ownProfile as any)[row.profileKey] : null}
                            format={row.format}
                            isEditing={editingCell?.domain === comp.domain && editingCell.rowId === row.id}
                            onDoubleClick={() => row.isManualEntry && setEditingCell({ domain: comp.domain, rowId: row.id })}
                            onSave={(val) => handleCellEdit(comp.domain, row.profileKey, val)}
                            onCancel={() => setEditingCell(null)}
                          />
                          {row.isManualEntry && !editingCell && (
                            <button 
                              onClick={() => setEditingCell({ domain: comp.domain, rowId: row.id })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 p-1 text-[#333] hover:text-[#888] transition-all"
                            >
                              <Pencil size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CellProps {
  value: any;
  ownValue?: any;
  format: string;
  isOwnSite?: boolean;
  isEditing?: boolean;
  onDoubleClick?: () => void;
  onSave?: (val: any) => void;
  onCancel?: () => void;
}

function ComparisonCell({ value, ownValue, format, isOwnSite, isEditing, onDoubleClick, onSave, onCancel }: CellProps) {
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => {
    setDraft(String(value ?? ''));
  }, [value, isEditing]);

  const getColor = () => {
    if (isOwnSite || ownValue === null || value === null || value === undefined) return '';
    
    if (format === 'number' || format === 'score_100') {
      const v = Number(value);
      const ov = Number(ownValue);
      if (!isNaN(v) && !isNaN(ov)) {
        if (v > ov * 1.2) return 'text-red-400';     // They're significantly ahead
        if (ov > v * 1.2) return 'text-green-400';   // We're significantly ahead
      }
    }
    return '';
  };

  const castValue = (val: string, format: string) => {
    if (format === 'number' || format === 'score_100') return Number(val);
    if (format === 'boolean' || format === 'manual_boolean') return val.toLowerCase() === 'true' || val === '1' || val === '✅';
    return val;
  };

  if (isEditing) {
    return (
      <div className="px-2 py-1 h-full flex items-center bg-[#111]">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => onSave?.(castValue(draft, format))}
          onKeyDown={e => { 
            if (e.key === 'Enter') onSave?.(castValue(draft, format)); 
            if (e.key === 'Escape') onCancel?.(); 
          }}
          className="w-full bg-black border border-[#F5364E] rounded px-1.5 py-0.5 text-[11px] text-white outline-none"
          autoFocus
        />
      </div>
    );
  }

  const formatValue = () => {
    if (value === null || value === undefined || value === '') return <span className="text-[#222]">/</span>;
    if (format === 'boolean' || format === 'manual_boolean') return value ? <span className="text-green-500">✅</span> : <span className="text-red-500/30">❌</span>;
    if (format === 'number') return typeof value === 'number' ? value.toLocaleString() : value;
    if (format === 'url') return <a href={value} target="_blank" rel="noreferrer" className="text-blue-400/80 hover:text-blue-400 hover:underline truncate max-w-full block">{value.replace(/^https?:\/\//, '')}</a>;
    if (format === 'score_100') return <ScoreBar value={Number(value)} />;
    if (format === 'list' && Array.isArray(value)) return value.length > 0 ? value.join(', ') : <span className="text-[#222]">/</span>;
    return String(value);
  };

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className={`px-4 py-2 text-[11px] h-full flex items-center justify-center font-medium ${getColor()} ${isOwnSite ? 'bg-white/5' : ''} ${!isEditing ? 'truncate' : ''}`}
    >
      {formatValue()}
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? '#22C55E' : value >= 50 ? '#FACC15' : '#F5364E';
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <div className="w-12 h-1 rounded-full bg-[#1a1a1a] overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono text-[#555]">{value}</span>
    </div>
  );
}

