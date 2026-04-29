import React from 'react'
import { Chip } from './Chip'

export function StatTile({
  label, value, sub, delta, tone,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  delta?: { value: number; suffix?: string }
  tone?: 'good' | 'warn' | 'bad'
}) {
  const toneClass = tone === 'good' ? 'text-[#4ade80]'
    : tone === 'warn' ? 'text-[#fbbf24]'
    : tone === 'bad'  ? 'text-[#f87171]' : 'text-white'
  return (
    <div className="rounded border border-[#1a1a1a] bg-[#0d0d0d] p-2">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-wider text-[#777]">{label}</div>
        {delta && (
          <Chip tone={delta.value >= 0 ? 'good' : 'bad'} dense>
            {delta.value >= 0 ? '+' : ''}{delta.value}{delta.suffix ?? ''}
          </Chip>
        )}
      </div>
      <div className={`mt-1 text-[18px] font-mono tabular-nums leading-none ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 text-[10px] text-[#666]">{sub}</div>}
    </div>
  )
}
