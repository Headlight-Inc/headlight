import React from 'react';
import { LayoutGrid, BarChart2, ListChecks, LayoutDashboard } from 'lucide-react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import type { WqaViewMode } from '../../../services/WebsiteQualityModeTypes';

const VIEWS: Array<{ id: WqaViewMode; label: string; Icon: React.ElementType }> = [
  { id: 'grid',      label: 'Grid',      Icon: LayoutGrid     },
  { id: 'overview',  label: 'Overview',  Icon: BarChart2      },
  { id: 'actions',   label: 'Actions',   Icon: ListChecks     },
  { id: 'structure', label: 'Structure', Icon: LayoutDashboard },
];

export default function WqaViewSwitcher() {
  const { wqaState, setWqaViewMode } = useSeoCrawler();
  const current = wqaState.viewMode;

  return (
    <div className="flex items-center gap-0.5 bg-[#111] border border-[#222] rounded-lg p-0.5">
      {VIEWS.map(({ id, label, Icon }) => {
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => setWqaViewMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              active
                ? 'bg-[#1e1e1e] text-white shadow-sm'
                : 'text-[#555] hover:text-[#aaa] hover:bg-[#161616]'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
