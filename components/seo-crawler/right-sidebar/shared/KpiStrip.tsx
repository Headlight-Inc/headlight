import React from 'react'
import { Sparkline } from './Sparkline'

export interface KpiTile {
  label: string
  value: React.ReactNode
  delta?: { value: number; positiveIsGood?: boolean }
  spark?: ReadonlyArray<number>
  tone?: 'good' | 'warn' | 'bad'
}

export function KpiStrip({ tiles, columns = 2 }: { tiles: ReadonlyArray<KpiTile>; columns?: 2 | 3 | 4 }) {
  if (!tiles || tiles.length === 0) {
    return <div className="text-[11px] italic text-[#555] py-2">No KPIs yet.</div>
  }
  const grid = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <div className={`grid ${grid} gap-2`}>
      {tiles.map((t, i) => {
        const good = t.delta && ((t.delta.positiveIsGood ?? true) ? t.delta.value >= 0 : t.delta.value <= 0)
        const dColor = !t.delta ? '' : good ? 'text-emerald-400' : 'text-red-400'
        return (
          <div key={i} className="bg-[#0f0f0f] border border-[#1f1f1f] rounded p-2">
            <div className="text-[9px] uppercase tracking-widest text-[#666]">{t.label}</div>
            <div className="flex items-end justify-between mt-1">
              <div className={`text-[16px] font-bold tabular-nums ${t.tone === 'warn' ? 'text-amber-300' : t.tone === 'bad' ? 'text-red-300' : 'text-white'}`}>{t.value}</div>
              {t.delta && <div className={`text-[10px] tabular-nums ${dColor}`}>{t.delta.value > 0 ? '+' : ''}{(t.delta.value * 100).toFixed(1)}%</div>}
            </div>
            {t.spark && t.spark.length > 1 && <div className="mt-1"><Sparkline points={t.spark} width={120} height={18} /></div>}
          </div>
        )
      })}
    </div>
  )
}
