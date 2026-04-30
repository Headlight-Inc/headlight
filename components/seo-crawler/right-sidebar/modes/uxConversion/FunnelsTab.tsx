import React from 'react'
import { Card, Row, ProgressBar, RsPartial } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { UxConversionStats } from '../../../../../services/right-sidebar/uxConversion'

export function UxFunnelsTab({ stats: { funnels: fn } }: RsTabProps<UxConversionStats>) {
  if (!fn.steps.length) return <RsPartial title="No funnels configured" reason="Define a GA4 funnel to surface drop-off." />
  const max = Math.max(1, fn.steps[0].users)
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Funnel">
        {fn.steps.map((s, i) => (
          <div key={s.name} className="mb-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#ccc]">{i + 1}. {s.name}</span>
              <span className="font-mono text-[#aaa]">{s.users.toLocaleString()}{i > 0 ? ` · -${s.dropPct}%` : ''}</span>
            </div>
            <ProgressBar value={s.users} max={max} tone={i === 0 ? 'good' : s.dropPct >= 50 ? 'bad' : s.dropPct >= 25 ? 'warn' : 'good'} />
          </div>
        ))}
      </Card>
      <Card title="Worst step">
        <Row label="Top drop-off"   value={fn.topDropoffStep ?? '—'} tone={fn.topDropoffStep ? 'warn' : 'good'} />
        <Row label="Median time"    value={fn.medianTimeSec != null ? `${fn.medianTimeSec}s` : '—'} />
      </Card>
    </div>
  )
}
