// components/seo-crawler/right-sidebar/shared/charts/Histogram.tsx
export interface HistogramBin { label: string; count: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }

const TONE_FILL: Record<NonNullable<HistogramBin['tone']>, string> = {
  good: 'bg-emerald-500/60', warn: 'bg-amber-500/60', bad: 'bg-red-500/60', neutral: 'bg-neutral-500/60',
}

export function Histogram({ bins, max }: { bins: HistogramBin[]; max?: number }) {
  const peak = max ?? Math.max(1, ...bins.map(b => b.count))
  return (
    <div className="flex flex-col gap-1">
      {bins.map(b => (
        <div key={b.label} className="grid grid-cols-[64px_1fr_36px] items-center gap-2 text-[10px] text-[#aaa]">
          <span className="truncate">{b.label}</span>
          <div className="h-2 rounded bg-[#1a1a1a] overflow-hidden">
            <div className={`h-full ${TONE_FILL[b.tone ?? 'neutral']}`} style={{ width: `${(b.count / peak) * 100}%` }} />
          </div>
          <span className="text-right tabular-nums text-neutral-300">{b.count}</span>
        </div>
      ))}
    </div>
  )
}
