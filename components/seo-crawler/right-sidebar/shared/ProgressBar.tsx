import React from 'react'
import { scoreTone } from '../../../../services/right-sidebar/utils'
export function ProgressBar({ value, max = 100, tone, height = 6 }: {
  value: number; max?: number; tone?: 'good' | 'warn' | 'bad' | 'info'; height?: number
}) {
  const p = Math.max(0, Math.min(100, (value / max) * 100))
  const t = tone ?? scoreTone(p)
  const bg = t === 'good' ? 'bg-emerald-500' : t === 'warn' ? 'bg-amber-500' : t === 'bad' ? 'bg-red-500' : 'bg-blue-500'
  return (
    <div className="w-full bg-[#1a1a1a] rounded-full overflow-hidden" style={ { height } }>
      <div className={`h-full ${bg} transition-all`} style={ { width: `${p}%` } } />
    </div>
  )
}
