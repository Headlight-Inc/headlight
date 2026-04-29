import React, { useRef } from 'react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';
import FaSidebarShell from './audit-tabs/FaSidebarShell';
import FaSidebarRouter from './audit-tabs/FaSidebarRouter';
import { RsShell } from './right-sidebar/RsShell';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MIN_W = 280;
const MAX_W = 600;

export default function AuditSidebar() {
    const { 
        mode, 
        showAuditSidebar, 
        setShowAuditSidebar,
        auditSidebarWidth, 
        setAuditSidebarWidth,
        setIsDraggingSidebar,
        isDraggingSidebar
    } = useSeoCrawler() as any;

    const startX = useRef(0);
    const startW = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX;
        startW.current = auditSidebarWidth || 360;
        setIsDraggingSidebar?.(true);
        document.body.style.cursor = 'col-resize';
        
        const onMove = (ev: MouseEvent) => {
            const dx = startX.current - ev.clientX;
            const next = Math.max(MIN_W, Math.min(MAX_W, startW.current + dx));
            setAuditSidebarWidth(next);
        };
        
        const onUp = () => {
            setIsDraggingSidebar?.(false);
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    if (!showAuditSidebar) {
        return (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[100]">
                <button
                    onClick={() => setShowAuditSidebar(true)}
                    className="flex h-12 w-[18px] items-center justify-center rounded-l border border-r-0 border-[#222] bg-[#0a0a0a] text-[#888] shadow-xl hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    title="Expand right sidebar"
                >
                    <ChevronLeft size={14} />
                </button>
            </div>
        );
    }

    // 1. Full Audit Mode (Legacy path until migrated to RsShell)
    if (mode === 'fullAudit') {
        return (
            <aside 
                className="relative flex h-full flex-col border-l border-[#222] bg-[#0a0a0a]"
                style={{ width: auditSidebarWidth || 360 }}
            >
                <div
                    onMouseDown={onMouseDown}
                    className={`absolute left-0 top-0 z-50 h-full w-1 cursor-col-resize transition-colors ${
                        isDraggingSidebar ? 'bg-[#F5364E]/40' : 'bg-transparent hover:bg-[#F5364E]/30'
                    }`}
                />
                <button
                    onClick={() => setShowAuditSidebar(false)}
                    className="absolute -left-[18px] top-1/2 -translate-y-1/2 z-[100] flex h-12 w-[18px] items-center justify-center rounded-l border border-r-0 border-[#222] bg-[#0a0a0a] text-[#888] shadow-xl hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    title="Collapse right sidebar"
                >
                    <ChevronRight size={14} />
                </button>
                <FaSidebarShell>
                    <FaSidebarRouter />
                </FaSidebarShell>
            </aside>
        );
    }

    // 2. Fallback to the new RsShell system for all other modes (WQA, Competitors, Technical, etc.)
    return <RsShell />;
}
