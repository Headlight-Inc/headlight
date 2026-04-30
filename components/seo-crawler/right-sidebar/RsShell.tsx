import React from 'react'
import { ChevronRight } from 'lucide-react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'
import { RsTabBar } from './RsTabBar'
import { RsRouter } from './RsRouter'

const MIN_W = 320
const MAX_W = 640

export function RsShell() {
    const {
        mode,
        showAuditSidebar, setShowAuditSidebar,
        auditSidebarWidth, setAuditSidebarWidth,
        isDraggingSidebar, setIsDraggingSidebar,
    } = useSeoCrawler()

    const startX = React.useRef(0)
    const startW = React.useRef(0)

    const onMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX
        startW.current = auditSidebarWidth
        setIsDraggingSidebar(true)
        document.body.style.cursor = 'col-resize'

        const onMove = (ev: MouseEvent) => {
            const dx = startX.current - ev.clientX
            const next = Math.max(MIN_W, Math.min(MAX_W, startW.current + dx))
            setAuditSidebarWidth(next)
        }
        const onUp = () => {
            setIsDraggingSidebar(false)
            document.body.style.cursor = ''
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    if (!showAuditSidebar) return null

    let modeLabel = 'Insights'
    try { modeLabel = getMode(mode).label } catch {}

    return (
        <aside
            id="rs-shell"
            className="relative flex h-full flex-col border-l border-[#1a1a1a] bg-[#0a0a0a]"
            style={{ width: auditSidebarWidth }}
            aria-label={`${modeLabel} insights`}
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
                title="Collapse insights"
            >
                <ChevronRight size={14} />
            </button>

            <header className="flex h-9 items-center justify-between border-b border-[#161616] px-3 shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                    {modeLabel} insights
                </span>
            </header>

            <RsTabBar />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <RsRouter />
            </div>
        </aside>
    )
}
