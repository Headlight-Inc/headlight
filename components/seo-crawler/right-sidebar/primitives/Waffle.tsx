import React from 'react'
export function Waffle({ filled, total, label }: { filled: number; total: number; label?: React.ReactNode }) {
    const pct = total === 0 ? 0 : Math.round((filled / total) * 100)
    const cells = Array.from({ length: 100 })
    return (
        <div className="flex items-center gap-3">
            <div className="grid grid-cols-10 gap-[2px] w-[70px]">
                {cells.map((_, i) => (
                    <div key={i} className={`w-[6px] h-[6px] rounded-sm ${i < pct ? 'bg-[#F5364E]/80' : 'bg-[#1a1a1a]'}`} />
                ))}
            </div>
            <div className="text-[10px]">
                <div className="text-white text-[16px] font-black tabular-nums leading-none">{pct}%</div>
                {label && <div className="text-[#666] mt-1">{label}</div>}
            </div>
        </div>
    )
}
