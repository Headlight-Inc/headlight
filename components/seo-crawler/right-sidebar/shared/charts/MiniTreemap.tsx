// components/seo-crawler/right-sidebar/shared/charts/MiniTreemap.tsx
import { useMemo } from 'react'

export interface TreemapNode { label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }

const TONE_BG: Record<NonNullable<TreemapNode['tone']>, string> = {
  good: 'bg-emerald-700/40 border-emerald-700/60',
  warn: 'bg-amber-700/40 border-amber-700/60',
  bad: 'bg-red-700/40 border-red-700/60',
  neutral: 'bg-neutral-800 border-neutral-700',
}

export function MiniTreemap({ nodes, height = 140 }: { nodes: TreemapNode[]; height?: number }) {
  const total = useMemo(() => nodes.reduce((s, n) => s + Math.max(0, n.value), 0) || 1, [nodes])
  return (
    <div className="flex flex-wrap gap-[2px]" style={{ height }}>
      {nodes.map(n => (
        <div
          key={n.label}
          className={`rounded-[2px] border px-1 py-0.5 text-[10px] text-neutral-200 ${TONE_BG[n.tone ?? 'neutral']}`}
          style={{ flex: `${n.value} 1 0`, minWidth: 48 }}
          title={`${n.label}: ${n.value}`}
        >
          <div className="truncate font-medium">{n.label}</div>
          <div className="tabular-nums text-[#aaa]">{Math.round((n.value / total) * 100)}%</div>
        </div>
      ))}
    </div>
  )
}
