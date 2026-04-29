import React from 'react'

export function Gauge({
  value, label,
}: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value))
  const stroke = v >= 80 ? '#4ade80' : v >= 60 ? '#fbbf24' : '#f87171'
  const r = 24, c = 2 * Math.PI * r
  const dash = (v / 100) * c
  return (
    <div className="flex flex-col items-center">
      <svg width={64} height={64} viewBox="0 0 64 64">
        <circle cx={32} cy={32} r={r} stroke="#1a1a1a" strokeWidth={6} fill="none" />
        <circle
          cx={32} cy={32} r={r} stroke={stroke} strokeWidth={6} fill="none"
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c / 4} strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text x={32} y={36} textAnchor="middle" fontSize={14} fill="#fff" fontFamily="monospace">{Math.round(v)}</text>
      </svg>
      {label && <div className="text-[10px] text-[#888] mt-1">{label}</div>}
    </div>
  )
}
