import React from 'react'

export function Donut({
  slices, segments, size = 64, label,
}: { 
  slices?: { value?: number; count?: number; color?: string; label?: string }[]
  segments?: { value?: number; count?: number; color?: string; label?: string }[]
  size?: number; label?: string 
}) {
  const rawItems = slices ?? segments ?? []
  const items = rawItems.map(item => ({
    ...item,
    value: item.value ?? item.count ?? 0
  }))

  const total = items.reduce((s, x) => s + x.value, 0) || 1
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1a1a1a" strokeWidth={6} fill="none" />
        {items.map((s, i) => {
          const dash = (s.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={s.color || '#4b5563'} strokeWidth={6} fill="none"
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size/2} ${size/2})`} />
          )
          offset += dash
          return el
        })}
      </svg>
      {label && <div className="text-[10px] text-[#aaa]">{label}</div>}
    </div>
  )
}
