import React from 'react'
export function StatTile({ label, value, tone, sub }: {
  label: string; value: React.ReactNode; tone?: 'good' | 'warn' | 'bad'; sub?: string
}) {
  const c = tone === 'good' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : tone === 'bad' ? 'text-red-300' : 'text-white'
  return (
    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded p-2">
      <div className="text-[9px] uppercase tracking-widest text-[#666]">{label}</div>
      <div className={`text-[16px] font-bold tabular-nums mt-0.5 ${c}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#666] mt-0.5">{sub}</div>}
    </div>
  )
}
