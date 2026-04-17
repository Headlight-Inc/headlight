import React from 'react';
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext';

export default function PagePreviewRow({ page }: { page: any }) {
    const { setSelectedPage } = useSeoCrawler();
    const path = (() => { try { return new URL(page.url).pathname || '/'; } catch { return page.url; } })();

    return (
        <button
            onClick={() => setSelectedPage(page)}
            className="w-full text-left px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111] hover:border-[#333] transition-colors flex items-center gap-3"
        >
            <div className="min-w-0 flex-1">
                <div className="text-[12px] text-white truncate">{page.title || path}</div>
                <div className="text-[10px] text-blue-400 font-mono truncate">{path}</div>
            </div>
            <div className="shrink-0 text-right">
                <div className="text-[11px] text-white font-mono">{Number(page.gscClicks || 0).toLocaleString()}</div>
                <div className="text-[9px] text-[#666]">clicks/30d</div>
            </div>
        </button>
    );
}
