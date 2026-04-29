import React from 'react'

export function Donut({
  segments, size = 64, label,
}: { segments: { value: number; color: string; label?: string }[]; size?: number; label?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1a1a1a" strokeWidth={6} fill="none" />
        {segments.map((s, i) => {
          const dash = (s.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={s.color} strokeWidth={6} fill="none"
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
