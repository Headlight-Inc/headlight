import React from 'react'

export function Bar({
  data, max, height = 60,
}: { data: { label: string; value: number; tone?: 'good' | 'warn' | 'bad' }[]; max?: number; height?: number }) {
  const m = max ?? Math.max(1, ...data.map(d => d.value))
  return (
    <div className="flex items-end gap-1" style={ { height } }>
      {data.map((d, i) => {
        const h = (d.value / m) * (height - 14)
        const color = d.tone === 'good' ? '#4ade80' : d.tone === 'warn' ? '#fbbf24' : d.tone === 'bad' ? '#f87171' : '#888'
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.label}: ${d.value}`}>
            <div className="rounded-sm w-full" style={ { height: `${h}px`, background: color } } />
            <div className="text-[8px] text-[#666] truncate w-full text-center">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}
