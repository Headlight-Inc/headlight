// components/seo-crawler/right-sidebar/shared/charts/BestTimeHeatmap.tsx
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

function shade(v: number, max: number): string {
  if (v <= 0) return 'bg-[#0e0e0e]'
  const t = v / Math.max(1, max)
  if (t > 0.75) return 'bg-emerald-500/80'
  if (t > 0.5)  return 'bg-emerald-500/55'
  if (t > 0.25) return 'bg-emerald-500/35'
  return 'bg-emerald-500/15'
}

export function BestTimeHeatmap({ buckets, hourLabels }:
  { buckets: number[][]; hourLabels: string[] }) {
  const max = Math.max(1, ...buckets.flat())
  return (
    <div className="flex flex-col gap-[2px] text-[9px] text-[#666]">
      <div className="grid grid-cols-[36px_repeat(7,minmax(0,1fr))] gap-[2px]">
        <span />
        {DAYS.map(d => <span key={d} className="text-center">{d}</span>)}
      </div>
      {buckets.map((row, i) => (
        <div key={hourLabels[i]} className="grid grid-cols-[36px_repeat(7,minmax(0,1fr))] gap-[2px]">
          <span className="text-right pr-1 tabular-nums">{hourLabels[i]}</span>
          {row.map((v, j) => <span key={j} className={`h-3 rounded-[2px] ${shade(v, max)}`} title={`${v}`} />)}
        </div>
      ))}
    </div>
  )
}
