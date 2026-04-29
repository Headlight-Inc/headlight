import React from 'react'

export function MiniRadar({
  axes, size = 120,
}: { axes: { axis: string; value: number }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 14
  const n = axes.length
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = (Math.max(0, Math.min(100, v)) / 100) * R
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const
  }
  const ringPts = (v: number) => Array.from({ length: n }, (_, i) => pt(i, v).join(',')).join(' ')
  const dataPts = axes.map((a, i) => pt(i, a.value).join(',')).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[25, 50, 75, 100].map(v => (
        <polygon key={v} points={ringPts(v)} fill="none" stroke="#1a1a1a" strokeWidth={1} />
      ))}
      <polygon points={dataPts} fill="#F5364E33" stroke="#F5364E" strokeWidth={1.25} />
      {axes.map((a, i) => {
        const [x, y] = pt(i, 110)
        return <text key={i} x={x} y={y} textAnchor="middle" fontSize={8} fill="#888">{a.axis}</text>
      })}
    </svg>
  )
}
