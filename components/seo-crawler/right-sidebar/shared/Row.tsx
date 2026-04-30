import React from 'react'
export type RowTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral'

const toneClass: Record<RowTone, string> = {
  good:    'text-emerald-400',
  warn:    'text-amber-400',
  bad:     'text-red-400',
  info:    'text-blue-400',
  neutral: 'text-[#ddd]',
}

export function Row({ label, value, tone = 'neutral' }: {
  label: React.ReactNode
  value: React.ReactNode
  tone?: RowTone
}) {
  return (
    <div className="flex items-center justify-between py-1 text-[12px]">
      <span className="text-[#888] truncate pr-3">{label}</span>
      <span className={`font-mono tabular-nums ${toneClass[tone]}`}>{value}</span>
    </div>
  )
}
