import React from 'react'
export function Sparkline({ points, width = 120, height = 24, stroke = '#7dd3fc' }: {
  points: ReadonlyArray<number>; width?: number; height?: number; stroke?: string
}) {
  if (!points || points.length < 2) return <div className="text-[10px] text-[#555]">—</div>
  const min = Math.min(...points), max = Math.max(...points), range = Math.max(1e-6, max - min)
  const dx = width / (points.length - 1)
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * dx} ${height - ((v - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
