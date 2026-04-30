// components/seo-crawler/right-sidebar/shared/charts/FunnelBar.tsx
export interface FunnelStep { label: string; users: number; flag?: 'warn' | 'bad' }

export function FunnelBar({ steps }: { steps: FunnelStep[] }) {
  const top = steps[0]?.users || 1
  return (
    <div className="flex flex-col gap-1">
      {steps.map((s, i) => {
        const pct = (s.users / top) * 100
        const drop = i > 0 ? ((steps[i - 1].users - s.users) / Math.max(1, steps[i - 1].users)) * 100 : 0
        const tone = s.flag === 'bad' ? 'bg-red-500/60' : s.flag === 'warn' ? 'bg-amber-500/60' : 'bg-emerald-500/60'
        return (
          <div key={s.label} className="text-[10px]">
            <div className="flex items-center justify-between text-[#aaa]">
              <span>{s.label}</span>
              <span className="tabular-nums">{s.users.toLocaleString()}{i > 0 && <span className="ml-2 text-[#666]">−{drop.toFixed(0)}%</span>}</span>
            </div>
            <div className="h-2 rounded bg-[#1a1a1a] overflow-hidden">
              <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
