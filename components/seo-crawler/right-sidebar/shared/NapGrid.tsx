// components/seo-crawler/right-sidebar/shared/NapGrid.tsx
export interface NapRow { source: string; name: 'ok' | 'warn' | 'fail'; address: 'ok' | 'warn' | 'fail'; phone: 'ok' | 'warn' | 'fail' }

const MARK: Record<NapRow['name'], { ch: string; cls: string }> = {
  ok:   { ch: '✓', cls: 'text-emerald-400' },
  warn: { ch: '⚠', cls: 'text-amber-400' },
  fail: { ch: '✗', cls: 'text-red-400' },
}

export function NapGrid({ rows }: { rows: NapRow[] }) {
  return (
    <div className="text-[10px]">
      <div className="grid grid-cols-[1fr_28px_28px_28px] text-[#666] mb-1">
        <span>Source</span><span className="text-right">N</span><span className="text-right">A</span><span className="text-right">P</span>
      </div>
      {rows.map(r => (
        <div key={r.source} className="grid grid-cols-[1fr_28px_28px_28px] py-0.5">
          <span className="truncate text-neutral-300">{r.source}</span>
          {(['name', 'address', 'phone'] as const).map(k => {
            const m = MARK[r[k]]
            return <span key={k} className={`text-right tabular-nums ${m.cls}`}>{m.ch}</span>
          })}
        </div>
      ))}
    </div>
  )
}
