// components/seo-crawler/right-sidebar/shared/ForecastPill.tsx
export interface Forecast { label: string; deltaValue: number; unit: string; confidencePct: number; positiveIsGood?: boolean }

export function ForecastPill({ f }: { f: Forecast }) {
  const positive = f.deltaValue >= 0
  const good = (f.positiveIsGood ?? true) ? positive : !positive
  const cls = good ? 'border-emerald-700/50 text-emerald-300 bg-emerald-900/20' : 'border-red-700/50 text-red-300 bg-red-900/20'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] tabular-nums ${cls}`}>
      <span>{positive ? '+' : ''}{f.deltaValue.toLocaleString()}{f.unit}</span>
      <span className="text-[#888]">·</span>
      <span className="text-[#aaa]">conf {Math.round(f.confidencePct)}%</span>
      <span className="text-[#888]">·</span>
      <span className="text-[#aaa]">{f.label}</span>
    </span>
  )
}
