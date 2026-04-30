import React from 'react'
export interface HistogramBin { label: string; count: number; tone?: 'good' | 'warn' | 'bad' }
export function Histogram({ bins, max, height = 80 }: { bins: ReadonlyArray<HistogramBin>; max?: number; height?: number }) {
  if (!bins || bins.length === 0) return <div className="text-[11px] italic text-[#555]">No data.</div>
  const m = max ?? Math.max(1, ...bins.map(b => b.count))
  const colour = (t?: string) => t === 'good' ? '#10b981' : t === 'warn' ? '#f59e0b' : t === 'bad' ? '#ef4444' : '#6b7280'
  return (
    <div className="flex items-end gap-1" style={ { height } }>
      {bins.map((b, i) => {
        const h = Math.max(1, (b.count / m) * (height - 18))
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${b.label}: ${b.count}`}>
            <div className="text-[9px] tabular-nums text-[#666]">{b.count}</div>
            <div className="w-full rounded-sm" style={ { height: h, backgroundColor: colour(b.tone) } } />
            <div className="text-[9px] text-[#888] truncate w-full text-center">{b.label}</div>
          </div>
        )
      })}
    </div>
  )
}
