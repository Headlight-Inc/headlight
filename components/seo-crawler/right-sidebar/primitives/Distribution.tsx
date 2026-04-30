import React from 'react'
export function Distribution({ buckets }: { buckets: { label: string; value: number }[] }) {
    const max = Math.max(1, ...buckets.map(b => b.value))
    return (
        <div className="flex items-end gap-1 h-[60px]">
            {buckets.map((b, i) => {
                const h = Math.max(4, Math.round((b.value / max) * 60))
                return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div className="w-full rounded-t bg-[#F5364E]/70" style={{ height: h }} title={`${b.label}: ${b.value}`} />
                        <div className="text-[9px] text-[#666] mt-1 truncate w-full text-center">{b.label}</div>
                    </div>
                )
            })}
        </div>
    )
}
