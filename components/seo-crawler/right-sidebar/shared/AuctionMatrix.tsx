// components/seo-crawler/right-sidebar/shared/AuctionMatrix.tsx
export interface AuctionRow {
  domain: string
  overlapPct: number
  abvPosPct?: number
  topOfPagePct?: number
  outranking?: number
}

function shade(v: number): string {
  if (v >= 60) return 'bg-emerald-500/40'
  if (v >= 30) return 'bg-amber-500/40'
  return 'bg-red-500/30'
}

export function AuctionMatrix({ rows }: { rows: AuctionRow[] }) {
  return (
    <div className="text-[10px]">
      <div className="grid grid-cols-[1fr_42px_42px_42px_42px] gap-1 text-[#666] mb-1">
        <span>Domain</span><span className="text-right">Ovrl</span><span className="text-right">AbvP</span><span className="text-right">Top%</span><span className="text-right">Outr</span>
      </div>
      {rows.map(r => (
        <div key={r.domain} className="grid grid-cols-[1fr_42px_42px_42px_42px] gap-1 items-center py-0.5">
          <span className="truncate text-neutral-300">{r.domain}</span>
          <span className={`text-right tabular-nums rounded px-1 ${shade(r.overlapPct)}`}>{Math.round(r.overlapPct)}%</span>
          <span className="text-right tabular-nums text-neutral-300">{r.abvPosPct == null ? '—' : `${Math.round(r.abvPosPct)}%`}</span>
          <span className="text-right tabular-nums text-neutral-300">{r.topOfPagePct == null ? '—' : `${Math.round(r.topOfPagePct)}%`}</span>
          <span className="text-right tabular-nums text-neutral-300">{r.outranking == null ? '—' : Math.round(r.outranking)}</span>
        </div>
      ))}
    </div>
  )
}
