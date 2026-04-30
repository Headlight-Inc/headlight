import React from 'react'

export interface StackedSegment { label: string; count: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }
export function StackedBar({ segments, height = 8 }: { segments: ReadonlyArray<StackedSegment>; height?: number }) {
  const total = Math.max(1, segments.reduce((s, x) => s + (x.count ?? 0), 0))
  const colour = (t?: string) =>
    t === 'good' ? '#10b981' : t === 'warn' ? '#f59e0b' : t === 'bad' ? '#ef4444' : '#6b7280'
  return (
    <div>
      <div className="flex w-full overflow-hidden rounded" style={ { height } }>
        {segments.map((s, i) => (
          <div key={i} title={`${s.label}: ${s.count}`}
               style={ { width: `${(s.count / total) * 100}%`, backgroundColor: colour(s.tone) } } />
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#aaa]">
        {segments.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-sm" style={ { backgroundColor: colour(s.tone) } } />
            {s.label} <span className="text-[#666] tabular-nums">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
