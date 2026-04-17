import React from 'react';
import { List, BarChart3, LayoutGrid, Network } from 'lucide-react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import { WqaViewMode } from '../../../services/WebsiteQualityModeTypes';

export default function WqaViewSwitcher() {
    const { wqaState, setWqaViewMode } = useSeoCrawler() as any;
    const currentMode = wqaState.viewMode || 'grid';

    const modes: Array<{ id: WqaViewMode; label: string; icon: any }> = [
        { id: 'grid', label: 'Grid', icon: List },
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'actions', label: 'Actions', icon: LayoutGrid },
        { id: 'structure', label: 'Structure', icon: Network },
    ];

    return (
        <div className="flex bg-[#0a0a0a] rounded border border-[#222] p-0.5">
            {modes.map(({ id, label, icon: Icon }) => {
                const isActive = currentMode === id;
                return (
                    <button
                        key={id}
                        onClick={() => setWqaViewMode(id)}
                        className={`px-3 py-1 text-[11px] font-medium rounded-sm flex items-center gap-1.5 transition-all ${
                            isActive 
                                ? 'bg-[#222] text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]' 
                                : 'text-[#888] hover:text-[#ccc] hover:bg-[#151515]'
                        }`}
                    >
                        <Icon size={12} className={isActive ? 'text-[#F5364E]' : ''} />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
