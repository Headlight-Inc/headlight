import React from 'react'
export function BestTimeHeatmap({ buckets, hourLabels }: {
  buckets: ReadonlyArray<ReadonlyArray<number>>   // 7 days × 24 hours, 0..1
  hourLabels?: ReadonlyArray<string>
}) {
  if (!buckets || buckets.length === 0) return <div className="text-[11px] italic text-[#555]">No engagement data.</div>
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <div className="grid gap-px" style={ { gridTemplateColumns: `auto repeat(${buckets[0]?.length ?? 24}, 1fr)` } }>
      <div />
      {(hourLabels ?? Array.from({ length: buckets[0]?.length ?? 24 }, (_, i) => `${i}`)).map((h, i) => (
        <div key={`h-${i}`} className="text-[8px] text-[#555] text-center">{i % 3 === 0 ? h : ''}</div>
      ))}
      {buckets.map((row, r) => (
        <React.Fragment key={`r-${r}`}>
          <div className="text-[9px] text-[#666] pr-1">{days[r] ?? ''}</div>
          {row.map((v, c) => (
            <div key={`c-${c}`} title={`${days[r]} ${c}:00 — ${(v * 100).toFixed(0)}%`}
                 className="h-3 rounded-sm"
                 style={ { backgroundColor: `rgba(99,102,241,${0.15 + 0.85 * Math.min(1, Math.max(0, v))})` } } />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}
