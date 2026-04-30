import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function DeltaPill({ value, suffix = '%', goodIsUp = true }: {
    value: number | null | undefined
    suffix?: string
    goodIsUp?: boolean
}) {
    if (value == null || Number.isNaN(value)) {
        return <span className="text-[10px] text-[#555]">——</span>
    }
    const up = value > 0
    const flat = value === 0
    const good = flat ? null : (up === goodIsUp)
    const cls = flat
        ? 'text-[#777] bg-[#1a1a1a] border-[#222]'
        : good
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-red-400 bg-red-500/10 border-red-500/20'
    const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 h-[18px] rounded text-[10px] font-bold border ${cls}`}>
            <Icon size={10} />
            {Math.abs(value).toFixed(1)}{suffix}
        </span>
    )
}
