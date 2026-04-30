import React from 'react'

export function Donut({ slices, total, label }: {
    slices: { label: string; value: number; color: string }[]
    total?: number
    label?: React.ReactNode
}) {
    const sum = (total ?? slices.reduce((a, b) => a + b.value, 0)) || 1
    const r = 28; const C = 2 * Math.PI * r
    let acc = 0
    return (
        <div className="flex items-center gap-3">
            <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
                <circle cx="40" cy="40" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
                {slices.map((s, i) => {
                    const len = (s.value / sum) * C
                    const dash = `${len} ${C - len}`
                    const offset = -acc
                    acc += len
                    return (
                        <circle key={i} cx="40" cy="40" r={r} fill="none" stroke={s.color} strokeWidth="10"
                                strokeDasharray={dash} strokeDashoffset={offset}
                                transform="rotate(-90 40 40)" />
                    )
                })}
            </svg>
            <div className="space-y-0.5 text-[10px]">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-[#aaa]">{s.label}</span>
                        <span className="text-[#666] tabular-nums">{Math.round((s.value / sum) * 100)}%</span>
                    </div>
                ))}
                {label && <div className="text-[#888] mt-0.5">{label}</div>}
            </div>
        </div>
    )
}
