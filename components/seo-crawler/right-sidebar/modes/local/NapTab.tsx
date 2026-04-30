import React from 'react'
import { Card, Row, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LocalStats } from '../../../../../services/right-sidebar/local'

export function LocalNapTab({ stats: { nap: n } }: RsTabProps<LocalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Consistency">
        <Row label="Score" value={`${n.consistencyPct}%`} tone={n.consistencyPct >= 95 ? 'good' : n.consistencyPct >= 80 ? 'warn' : 'bad'} />
        <ProgressBar value={n.consistencyPct} max={100} />
      </Card>
      <Card title="Coverage">
        <Row label="Pages without NAP" value={n.pagesWithoutNap} tone={n.pagesWithoutNap ? 'warn' : 'good'} />
      </Card>
      <Card title="Mismatches">
        {n.mismatches.length
          ? n.mismatches.slice(0, 6).map((m, i) => <Row key={`${m.url}-${m.field}-${i}`} label={`${shortUrl(m.url)} · ${m.field}`} value="mismatch" tone="bad" />)
          : <div className="text-[11px] italic text-[#555]">No NAP mismatches detected.</div>}
      </Card>
    </div>
  )
}
function shortUrl(u: string) { try { return new URL(u).pathname || u } catch { return u } }
