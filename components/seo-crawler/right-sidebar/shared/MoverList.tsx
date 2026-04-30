// components/seo-crawler/right-sidebar/shared/MoverList.tsx
export interface Mover { label: string; delta: number; unit?: string }

export function MoverList({ winners, losers }: { winners: Mover[]; losers: Mover[] }) {
  const Row = ({ m, kind }: { m: Mover; kind: 'win' | 'loss' }) => (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-[11px] py-0.5">
      <span className="truncate text-neutral-300">{m.label}</span>
      <span className={`tabular-nums ${kind === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
        {kind === 'win' ? '▲' : '▼'} {Math.abs(m.delta).toLocaleString()}{m.unit ?? ''}
      </span>
    </div>
  )
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Winners</div>
        {winners.length === 0 ? <div className="text-[10px] text-[#555]">—</div> : winners.map(m => <Row key={m.label} m={m} kind="win" />)}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Losers</div>
        {losers.length === 0 ? <div className="text-[10px] text-[#555]">—</div> : losers.map(m => <Row key={m.label} m={m} kind="loss" />)}
      </div>
    </div>
  )
}
