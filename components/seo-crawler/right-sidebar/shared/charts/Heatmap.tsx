import React from 'react'

export function Heatmap({
  rows, cols, values, max,
}: { rows: string[]; cols: string[]; values: number[][]; max?: number }) {
  const m = max ?? Math.max(1, ...values.flat())
  return (
    <div className="text-[9px] text-[#888]">
      <div className="flex pl-12 gap-0.5">{cols.map(c => <div key={c} className="w-4 truncate text-center">{c}</div>)}</div>
      {rows.map((r, ri) => (
        <div key={r} className="flex items-center gap-0.5 mt-0.5">
          <div className="w-12 truncate">{r}</div>
          {values[ri].map((v, ci) => {
            const a = m === 0 ? 0 : v / m
            return <div key={ci} className="w-4 h-4 rounded-sm" title={`${r} × ${cols[ci]}: ${v}`} style={ { background: `rgba(245, 54, 78, ${a})` } } />
          })}
        </div>
      ))}
    </div>
  )
}
