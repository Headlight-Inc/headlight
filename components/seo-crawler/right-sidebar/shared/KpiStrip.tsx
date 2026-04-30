// components/seo-crawler/right-sidebar/shared/KpiStrip.tsx
import { Sparkline } from './charts/Sparkline'

export interface KpiTile {
  label: string
  value: string | number
  delta?: { value: number; positiveIsGood?: boolean }   // -0.08 = ▼8%
  spark?: number[]
  tone?: 'good' | 'warn' | 'bad' | 'neutral'
}

function Delta({ d }: { d: NonNullable<KpiTile['delta']> }) {
  const positive = d.value >= 0
  const good = (d.positiveIsGood ?? true) ? positive : !positive
  const arrow = positive ? '▲' : '▼'
  const cls = good ? 'text-emerald-400' : 'text-red-400'
  return <span className={`tabular-nums ${cls}`}>{arrow} {Math.abs(d.value * 100).toFixed(1)}%</span>
}

export function KpiStrip({ tiles, columns = 2 }: { tiles: KpiTile[]; columns?: 2 | 3 | 4 }) {
  const grid = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'
  return (
    <div className={`grid ${grid} gap-2`}>
      {tiles.map(t => (
        <div key={t.label} className="rounded-md border border-[#1a1a1a] bg-[#0d0d0d] p-2">
          <div className="text-[10px] uppercase tracking-wider text-[#888]">{t.label}</div>
          <div className="text-[16px] font-semibold tabular-nums text-neutral-200">{t.value}</div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            {t.delta ? <Delta d={t.delta} /> : <span className="text-[#555]">—</span>}
            {t.spark && t.spark.length > 1 && <Sparkline points={t.spark} width={48} height={14} />}
          </div>
        </div>
      ))}
    </div>
  )
}
