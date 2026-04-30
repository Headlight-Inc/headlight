// components/seo-crawler/right-sidebar/shared/BotMatrix.tsx
export interface BotRow { bot: string; robotsAllowed: boolean; metaAllowed: boolean }

export function BotMatrix({ rows }: { rows: BotRow[] }) {
  const Cell = ({ ok }: { ok: boolean }) => (
    <span className={`inline-block w-4 text-center tabular-nums ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{ok ? '✓' : '✗'}</span>
  )
  return (
    <div className="text-[10px]">
      <div className="grid grid-cols-[1fr_44px_44px] text-[#666] mb-1">
        <span>Bot</span><span className="text-right">robots</span><span className="text-right">meta</span>
      </div>
      {rows.map(r => (
        <div key={r.bot} className="grid grid-cols-[1fr_44px_44px] items-center py-0.5">
          <span className="truncate text-neutral-300">{r.bot}</span>
          <span className="text-right"><Cell ok={r.robotsAllowed} /></span>
          <span className="text-right"><Cell ok={r.metaAllowed} /></span>
        </div>
      ))}
    </div>
  )
}
