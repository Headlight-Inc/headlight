import React from 'react'

export function StatRow({ label, value, sub, tone, mono }: {
    label: string
    value: React.ReactNode
    sub?: React.ReactNode
    tone?: 'good' | 'warn' | 'bad' | 'info' | null
    mono?: boolean
}) {
    const c =
        tone === 'good' ? 'text-emerald-400' :
        tone === 'warn' ? 'text-amber-400' :
        tone === 'bad'  ? 'text-red-400' :
        tone === 'info' ? 'text-sky-400' : 'text-white'
    return (
        <div className="flex items-center justify-between gap-2 py-1 text-[11px] border-b border-[#161616] last:border-b-0">
            <span className="text-[#888] truncate">{label}</span>
            <span className={`text-right ${mono ? 'font-mono' : ''} ${c} tabular-nums`}>{value}{sub ? <span className="text-[#666] ml-1">{sub}</span> : null}</span>
        </div>
    )
}
