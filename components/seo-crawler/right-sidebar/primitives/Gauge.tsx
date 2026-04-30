import React from 'react'

export function Gauge({ score, label, sub }: { score: number | null; label?: string; sub?: React.ReactNode }) {
    const safe = Math.max(0, Math.min(100, Number(score ?? 0)))
    const r = 36
    const circumference = 2 * Math.PI * r * 0.75 // 270°
    const offset = circumference - (safe / 100) * circumference
    const tone =
        safe >= 80 ? '#34d399' :
        safe >= 60 ? '#fbbf24' :
        safe >= 40 ? '#f97316' : '#ef4444'

    return (
        <div className="flex items-center justify-center py-2">
            <div className="relative">
                <svg width="120" height="100" viewBox="0 0 120 100">
                    <g transform="rotate(135 60 50)">
                        <circle cx="60" cy="50" r={r} fill="none" stroke="#1a1a1a" strokeWidth="8"
                                strokeDasharray={`${circumference} ${2 * Math.PI * r}`} strokeLinecap="round" />
                        <circle cx="60" cy="50" r={r} fill="none" stroke={tone} strokeWidth="8"
                                strokeDasharray={`${circumference} ${2 * Math.PI * r}`}
                                strokeDashoffset={offset} strokeLinecap="round" />
                    </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[26px] font-black tabular-nums text-white leading-none">{Math.round(safe)}</div>
                    {label && <div className="text-[9px] text-[#777] uppercase tracking-[0.14em] mt-1">{label}</div>}
                </div>
            </div>
            {sub && <div className="ml-3 text-[10px] text-[#888]">{sub}</div>}
        </div>
    )
}
