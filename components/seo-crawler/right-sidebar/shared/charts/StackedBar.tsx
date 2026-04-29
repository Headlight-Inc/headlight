import React from 'react'

export function StackedBar({
  segments, height = 8,
}: { segments: { value: number; color: string; label?: string }[]; height?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  return (
    <div className="w-full overflow-hidden rounded flex" style={ { height } }>
      {segments.map((s, i) => (
        <div key={i} title={s.label} style={ { width: `${(s.value / total) * 100}%`, background: s.color } } />
      ))}
    </div>
  )
}
