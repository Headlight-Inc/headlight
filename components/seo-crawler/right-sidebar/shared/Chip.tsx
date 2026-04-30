import React from 'react'
export function Chip({
  tone = 'neutral', children,
}: { tone?: 'good' | 'warn' | 'bad' | 'neutral'; children: React.ReactNode }) {
  const cls =
    tone === 'good' ? 'border-emerald-700/50 text-emerald-300 bg-emerald-900/20' :
    tone === 'warn' ? 'border-amber-700/50 text-amber-300 bg-amber-900/20'   :
    tone === 'bad'  ? 'border-red-700/50 text-red-300 bg-red-900/20'         :
                      'border-[#2a2a2a] text-[#bbb] bg-[#141414]'
  return <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${cls}`}>{children}</span>
}
