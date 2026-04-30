import React from 'react'

export type Bar = { id?: string; label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'info' | 'neutral'; meta?: React.ReactNode }

export function Bars({ items, maxOverride }: { items: Bar[]; maxOverride?: number }) {
    const max = maxOverride ?? Math.max(1, ...items.map(i => i.value))
    return (
        <div className="space-y-1">
            {items.map((b, i) => {
                const pct = Math.max(2, Math.round((b.value / max) * 100))
                const fill =
                    b.tone === 'good' ? 'bg-emerald-500/70' :
                    b.tone === 'warn' ? 'bg-amber-500/70' :
                    b.tone === 'bad'  ? 'bg-red-500/70' :
                    b.tone === 'info' ? 'bg-sky-500/70' :
                    'bg-[#F5364E]/70'
                return (
                    <div key={b.id ?? i} className="flex items-center gap-2 text-[11px]">
                        <div className="w-[78px] truncate text-[#aaa]">{b.label}</div>
                        <div className="flex-1 h-[14px] bg-[#141414] rounded-sm overflow-hidden">
                            <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-[44px] text-right tabular-nums text-[#bbb]">{b.value.toLocaleString()}</div>
                        {b.meta && <div className="w-[28px] text-right text-[#666]">{b.meta}</div>}
                    </div>
                )
            })}
        </div>
    )
}
