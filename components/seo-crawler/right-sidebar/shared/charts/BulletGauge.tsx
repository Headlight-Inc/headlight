import React from 'react'

export function BulletGauge({
  value, target, max, label,
}: { value: number; target: number; max: number; label?: string }) {
  const v = Math.max(0, Math.min(max, value))
  return (
    <div className="w-full">
      {label && <div className="text-[10px] text-[#888] mb-1">{label}</div>}
      <div className="relative h-2 rounded bg-[#161616] overflow-hidden">
        <div className="absolute inset-y-0 left-0" style={ { width: `${(v / max) * 100}%`, background: v >= target ? '#4ade80' : '#f87171' } } />
        <div className="absolute top-0 bottom-0 w-px bg-white" style={ { left: `${(target / max) * 100}%` } } />
      </div>
    </div>
  )
}
