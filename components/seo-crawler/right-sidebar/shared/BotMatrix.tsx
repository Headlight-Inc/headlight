import React from 'react'
export function BotMatrix({ rows }: { rows: ReadonlyArray<{ bot: string; allowed: boolean; rate?: number }> }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] text-[11px] gap-x-3">
      <div className="text-[10px] uppercase tracking-widest text-[#666]">Bot</div>
      <div className="text-[10px] uppercase tracking-widest text-[#666]">Status</div>
      <div className="text-[10px] uppercase tracking-widest text-[#666]">Rate</div>
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <div className="text-[#ccc]">{r.bot}</div>
          <div className={r.allowed ? 'text-emerald-400' : 'text-red-400'}>{r.allowed ? 'allow' : 'block'}</div>
          <div className="text-[#888] tabular-nums">{r.rate != null ? `${r.rate}/s` : '—'}</div>
        </React.Fragment>
      ))}
    </div>
  )
}
