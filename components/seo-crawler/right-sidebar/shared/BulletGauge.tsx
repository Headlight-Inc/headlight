import React from 'react'
export function BulletGauge({ value, target, max, height = 8 }: {
  value: number; target: number; max: number; height?: number
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  const tgt = Math.max(0, Math.min(100, (target / Math.max(1, max)) * 100))
  const tone = value <= target ? '#10b981' : value <= target * 1.5 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-full bg-[#1a1a1a] rounded-full overflow-hidden" style={ { height } }>
      <div className="h-full transition-all" style={ { width: `${pct}%`, backgroundColor: tone } } />
      <div className="absolute top-[-2px] bottom-[-2px] w-px bg-white" style={ { left: `${tgt}%` } } />
    </div>
  )
}
