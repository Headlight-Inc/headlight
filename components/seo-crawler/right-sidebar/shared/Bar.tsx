import React from 'react'
export function Bar({ data, max, height = 60 }: {
  data: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' }[]; max?: number; height?: number
}) {
  const m = max ?? Math.max(1, ...data.map(d => d.value))
  const c = (t?: string) => t === 'good' ? '#10b981' : t === 'warn' ? '#f59e0b' : t === 'bad' ? '#ef4444' : '#6b7280'
  return (
    <div className="flex items-end gap-1" style={ { height } }>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.label}: ${d.value}`}>
          <div className="w-full rounded-sm" style={ { height: (d.value / m) * (height - 14), backgroundColor: c(d.tone) } } />
          <div className="text-[8px] text-[#666] truncate w-full text-center">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
