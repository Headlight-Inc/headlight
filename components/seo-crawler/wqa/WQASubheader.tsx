import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock, Download, GitCompare, Globe, Languages, Package, RefreshCw, Tag } from 'lucide-react';
import type { WebsiteQualityState, WqaViewMode } from '../../../services/WebsiteQualityModeTypes';
import { getEffectiveIndustry, getEffectiveLanguage } from '../../../services/WebsiteQualityModeTypes';
import type { DetectedIndustry } from '../../../services/SiteTypeDetector';

interface WQASubheaderProps {
  wqaState: WebsiteQualityState;
  urlInput: string;
  isCrawling: boolean;
  lastCrawlTime: string | null;
  activeView: WqaViewMode;
  onViewChange: (view: WqaViewMode) => void;
  onIndustryOverride: (industry: DetectedIndustry | null) => void;
  onLanguageOverride: (lang: string | null) => void;
  onReCrawl: () => void;
  onCompare: () => void;
  onExport: () => void;
}

const INDUSTRY_OPTIONS: Array<{ id: DetectedIndustry; label: string; icon: string }> = [
  { id: 'general', label: 'General', icon: '🌐' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'news', label: 'News / Magazine', icon: '📰' },
  { id: 'blog', label: 'Blog / Content', icon: '📝' },
  { id: 'local', label: 'Local Business', icon: '📍' },
  { id: 'saas', label: 'SaaS', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { id: 'restaurant', label: 'Restaurant / Food', icon: '🍽️' },
  { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
  { id: 'job_board', label: 'Job Board', icon: '💼' },
];

const LANGUAGE_OPTIONS = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'nl',
  'ru',
  'zh',
  'ja',
  'ko',
  'ar',
  'hi',
  'tr',
  'pl',
  'sv',
  'da',
  'no',
  'fi',
  'cs',
  'hu',
  'ro',
  'bg',
  'hr',
  'sr',
  'bs',
  'sk',
  'sl',
  'uk',
  'el',
  'th',
  'vi',
  'id',
  'ms',
  'he',
  'fa',
];

const VIEW_TABS: Array<{ id: WqaViewMode; label: string; icon: string }> = [
  { id: 'grid', label: 'Grid', icon: '■' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'priorities', label: 'Priorities', icon: '⚡' },
];

export default function WQASubheader({
  wqaState,
  urlInput,
  isCrawling,
  lastCrawlTime,
  activeView,
  onViewChange,
  onIndustryOverride,
  onLanguageOverride,
  onReCrawl,
  onCompare,
  onExport,
}: WQASubheaderProps) {
  const effectiveIndustry = getEffectiveIndustry(wqaState);
  const effectiveLanguage = getEffectiveLanguage(wqaState);
  const isOverriddenIndustry = wqaState.industryOverride !== null;
  const isOverriddenLanguage = wqaState.languageOverride !== null;

  const industryOption = INDUSTRY_OPTIONS.find((o) => o.id === effectiveIndustry) || INDUSTRY_OPTIONS[0];
  const gradeColor =
    wqaState.siteScore >= 80
      ? 'text-green-400'
      : wqaState.siteScore >= 60
        ? 'text-yellow-400'
        : wqaState.siteScore >= 40
          ? 'text-orange-400'
          : 'text-red-400';

  return (
    <div className="border-b border-[#222] bg-[#0a0a0a] text-[#e0e0e0]">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Globe size={13} className="shrink-0 text-[#666]" />
            <span className="max-w-[200px] truncate text-[13px] font-medium text-white">{urlInput || 'No URL'}</span>
          </div>

          <DropdownPill
            icon={<Tag size={11} />}
            label={`${industryOption.icon} ${industryOption.label}`}
            suffix={
              isOverriddenIndustry ? undefined : wqaState.industryConfidence > 0 ? `${wqaState.industryConfidence}%` : 'auto'
            }
            isAuto={!isOverriddenIndustry}
            options={INDUSTRY_OPTIONS.map((o) => ({ id: o.id, label: `${o.icon} ${o.label}`, active: o.id === effectiveIndustry }))}
            onSelect={(id) => onIndustryOverride(id === wqaState.detectedIndustry ? null : (id as DetectedIndustry))}
            onReset={isOverriddenIndustry ? () => onIndustryOverride(null) : undefined}
          />

          <DropdownPill
            icon={<Languages size={11} />}
            label={effectiveLanguage.toUpperCase()}
            suffix={isOverriddenLanguage ? undefined : 'auto'}
            isAuto={!isOverriddenLanguage}
            options={LANGUAGE_OPTIONS.map((lang) => ({ id: lang, label: lang.toUpperCase(), active: lang === effectiveLanguage }))}
            onSelect={(id) => onLanguageOverride(id === wqaState.detectedLanguage ? null : id)}
            onReset={isOverriddenLanguage ? () => onLanguageOverride(null) : undefined}
          />

          {wqaState.detectedCms && (
            <span className="flex items-center gap-1 rounded border border-[#222] bg-[#111] px-2 py-0.5 text-[10px] text-[#888]">
              <Package size={10} />
              {wqaState.detectedCms}
            </span>
          )}

          {wqaState.isMultiLanguage && wqaState.detectedLanguages.length > 1 && (
            <span className="rounded border border-[#222] bg-[#111] px-2 py-0.5 text-[10px] text-[#888]">
              {wqaState.detectedLanguages.map((l) => l.code.toUpperCase()).join(', ')}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-bold ${gradeColor}`}>{wqaState.siteGrade}</span>
            <span className="text-[11px] text-[#666]">({wqaState.siteScore}/100)</span>
            {wqaState.scoreDelta !== 0 && (
              <span className={`text-[10px] ${wqaState.scoreDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {wqaState.scoreDelta > 0 ? '↑' : '↓'}
                {Math.abs(wqaState.scoreDelta)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#666]">Pages: {wqaState.siteStats?.totalPages?.toLocaleString() || '—'}</span>
          <span className="text-[11px] text-[#666]">Indexed: {wqaState.siteStats?.indexedPages?.toLocaleString() || '—'}</span>
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isCrawling ? 'animate-pulse bg-yellow-400' : 'bg-green-400'}`} />
            <span className="text-[10px] text-[#666]">{isCrawling ? 'Crawling...' : 'Idle'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#1a1a1a] px-4 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onReCrawl}
            disabled={isCrawling}
            className="flex items-center gap-1.5 rounded border border-[#F5364E]/30 bg-[#F5364E]/10 px-3 py-1.5 text-[11px] text-[#F5364E] transition-colors hover:bg-[#F5364E]/20 disabled:opacity-40"
          >
            <RefreshCw size={12} className={isCrawling ? 'animate-spin' : ''} />
            {isCrawling ? 'Crawling...' : 'Re-crawl'}
          </button>
          <button
            onClick={onCompare}
            className="flex items-center gap-1.5 rounded border border-[#222] bg-[#1a1a1a] px-3 py-1.5 text-[11px] text-[#ccc] transition-colors hover:bg-[#222]"
          >
            <GitCompare size={12} />
            Compare
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 rounded border border-[#222] bg-[#1a1a1a] px-3 py-1.5 text-[11px] text-[#ccc] transition-colors hover:bg-[#222]"
          >
            <Download size={12} />
            Export
          </button>
          {lastCrawlTime && (
            <span className="flex items-center gap-1 text-[10px] text-[#555]">
              <Clock size={10} />
              Last: {lastCrawlTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 rounded border border-[#222] bg-[#111] p-0.5">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`rounded px-3 py-1 text-[11px] font-medium transition-colors ${
                activeView === tab.id ? 'bg-[#222] text-white' : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DropdownPillProps {
  icon: React.ReactNode;
  label: string;
  suffix?: string;
  isAuto: boolean;
  options: Array<{ id: string; label: string; active: boolean }>;
  onSelect: (id: string) => void;
  onReset?: () => void;
}

function DropdownPill({ icon, label, suffix, isAuto, options, onSelect, onReset }: DropdownPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] transition-colors ${
          isAuto ? 'border-[#222] bg-[#111] text-[#888] hover:border-[#333]' : 'border-[#F5364E]/30 bg-[#F5364E]/5 text-[#F5364E]'
        }`}
      >
        {icon}
        <span className="max-w-[120px] truncate">{label}</span>
        {suffix && <span className="text-[#555]">({suffix})</span>}
        <ChevronDown size={10} className="text-[#555]" />
      </button>

      {open && (
        <div className="custom-scrollbar absolute left-0 top-full z-50 mt-1 max-h-[300px] min-w-[180px] overflow-y-auto rounded-lg border border-[#222] bg-[#0d0d0f] py-1 shadow-2xl">
          {onReset && (
            <button
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="w-full border-b border-[#222] px-3 py-1.5 text-left text-[11px] text-[#F5364E] hover:bg-[#1a1a1a]"
            >
              ↩ Reset to auto-detected
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.id);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-[11px] transition-colors ${
                opt.active ? 'bg-[#F5364E]/10 text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-[#ccc]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
