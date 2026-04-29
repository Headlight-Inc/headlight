import React from 'react'
import { Sparkline } from './charts/Sparkline'
import { Chip } from './Chip'

export function KpiTile({
  label, value, series, delta, tone,
}: {
  label: string
  value: React.ReactNode
  series?: number[]
  delta?: number
  tone?: 'good' | 'warn' | 'bad'
}) {
  return (
    <div className="rounded border border-[#1a1a1a] bg-[#0d0d0d] p-2 flex flex-col gap-1">
      <div className="text-[10px] uppercase tracking-wider text-[#777]">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div className={`text-[16px] font-mono tabular-nums leading-none ${tone === 'bad' ? 'text-[#f87171]' : tone === 'warn' ? 'text-[#fbbf24]' : tone === 'good' ? 'text-[#4ade80]' : 'text-white'}`}>{value}</div>
        {delta !== undefined && (
          <Chip tone={delta >= 0 ? 'good' : 'bad'} dense>{delta >= 0 ? '+' : ''}{delta}%</Chip>
        )}
      </div>
      {series && series.length > 1 && <Sparkline data={series} height={20} />}
    </div>
  )
}
