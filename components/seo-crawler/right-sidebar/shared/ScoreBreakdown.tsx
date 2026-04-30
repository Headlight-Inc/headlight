// components/seo-crawler/right-sidebar/shared/ScoreBreakdown.tsx
export interface ScorePart { label: string; weight: number; value: number; reason?: string }

export function ScoreBreakdown({ parts, max = 100 }: { parts: ScorePart[]; max?: number }) {
  const totalW = parts.reduce((s, p) => s + p.weight, 0) || 1
  return (
    <div className="flex flex-col gap-1">
      {parts.map(p => {
        const contrib = (p.weight / totalW) * (p.value / max) * 100
        return (
          <div key={p.label} className="text-[10px]">
            <div className="flex items-center justify-between text-[#aaa]">
              <span className="truncate">{p.label}</span>
              <span className="tabular-nums text-neutral-300">{Math.round(p.value)}<span className="text-[#666]"> · w{(p.weight * 100).toFixed(0)}</span></span>
            </div>
            <div className="h-1.5 rounded bg-[#1a1a1a] overflow-hidden">
              <div className="h-full bg-violet-500/60" style={{ width: `${Math.max(0, Math.min(100, contrib))}%` }} />
            </div>
            {p.reason && <div className="mt-0.5 text-[#666]">{p.reason}</div>}
          </div>
        )
      })}
    </div>
  )
}
