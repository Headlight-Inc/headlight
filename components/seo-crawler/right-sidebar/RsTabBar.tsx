import React, { useEffect } from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'

export function RsTabBar() {
    const { mode, rsTab: rsTabByMode, setRsTab } = useSeoCrawler()

    let tabs: ReadonlyArray<{ id: string; label: string }> = []
    try { tabs = getMode(mode).rsTabs } catch {}

    const activeId = rsTabByMode?.[mode] || tabs[0]?.id
    useEffect(() => {
        if (!activeId && tabs[0]) setRsTab(mode, tabs[0].id)
    }, [activeId, mode, tabs, setRsTab])

    if (tabs.length === 0) return null

    return (
        <nav
            role="tablist"
            aria-label="Insight tabs"
            className="flex h-8 items-center border-b border-[#161616] bg-[#0a0a0a] overflow-x-auto custom-scrollbar-hidden shrink-0"
        >
            {tabs.map((t) => {
                const on = t.id === activeId
                return (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={on}
                        onClick={() => setRsTab(mode, t.id)}
                        className={`relative h-8 px-3 text-[11px] whitespace-nowrap transition-colors ${
                            on ? 'text-white' : 'text-[#888] hover:text-[#ccc]'
                        }`}
                    >
                        {t.label}
                        {on && (
                            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#F5364E] rounded-full" />
                        )}
                    </button>
                )
            })}
        </nav>
    )
}
