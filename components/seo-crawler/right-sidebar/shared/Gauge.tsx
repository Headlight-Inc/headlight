import React from 'react'
import { scoreTone } from '../../../../services/right-sidebar/utils'
export function Gauge({ value, label, max = 100 }: { value: number; label?: string; max?: number }) {
  const p = Math.max(0, Math.min(100, (value / max) * 100))
  const tone = scoreTone(p)
  const colour = tone === 'good' ? '#10b981' : tone === 'warn' ? '#f59e0b' : tone === 'bad' ? '#ef4444' : '#6b7280'
  const r = 26, c = 2 * Math.PI * r
  const dash = (p / 100) * c
  return (
    <div className="relative w-[64px] h-[64px]" title={label}>
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#1f1f1f" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r={r} stroke={colour} strokeWidth="6" fill="none"
                strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[14px] font-bold tabular-nums text-white">{Math.round(p)}</div>
        {label && <div className="text-[8px] uppercase tracking-widest text-[#666]">{label}</div>}
      </div>
    </div>
  )
}
