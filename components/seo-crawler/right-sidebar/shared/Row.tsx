import React from 'react'

export function Row({
  label, value, hint, right, tone,
}: {
  label: React.ReactNode
  value?: React.ReactNode
  hint?: React.ReactNode
  right?: React.ReactNode
  tone?: 'good' | 'warn' | 'bad' | 'info' | 'neutral'
}) {
  const toneClass = tone === 'good' ? 'text-[#4ade80]'
    : tone === 'warn' ? 'text-[#fbbf24]'
    : tone === 'bad'  ? 'text-[#f87171]'
    : tone === 'info' ? 'text-[#60a5fa]'
    : 'text-white'
  return (
    <div className="flex items-center justify-between py-1">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-[#bbb] truncate">{label}</div>
        {hint && <div className="text-[10px] text-[#666] truncate">{hint}</div>}
      </div>
      {right ?? (
        <div className={`text-[11px] font-mono tabular-nums shrink-0 ml-2 ${toneClass}`}>
          {value ?? '—'}
        </div>
      )}
    </div>
  )
}
