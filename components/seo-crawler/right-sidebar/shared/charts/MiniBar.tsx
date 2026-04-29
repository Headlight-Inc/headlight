import React from 'react'

export function MiniBar({
  value, max, tone, height = 6,
}: { value: number; max: number; tone?: 'good' | 'warn' | 'bad' | 'neutral'; height?: number }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  const color = tone === 'good' ? '#4ade80' : tone === 'warn' ? '#fbbf24' : tone === 'bad' ? '#f87171' : '#888'
  return (
    <div className="w-full rounded bg-[#161616] overflow-hidden" style={ { height } }>
      <div className="h-full rounded" style={ { width: `${pct}%`, background: color } } />
    </div>
  )
}
