import React from 'react'
import { Card, Row, Sparkline, Histogram } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { PaidStats } from '../../../../../services/right-sidebar/paid'

export function PaidSpendTab({ stats: { spend: s } }: RsTabProps<PaidStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Trend (30d)">{s.trend.length > 1 ? <Sparkline points={s.trend} width={280} height={36} /> : <div className="text-[11px] italic text-[#555]">No trend data.</div>}</Card>
      <Card title="By channel">
        {s.byChannel.length
          ? <Histogram bins={s.byChannel.map(c => ({ label: c.channel, count: c.amount }))} />
          : <div className="text-[11px] italic text-[#555]">No channel breakdown.</div>}
      </Card>
      <Card title="Top campaigns">
        {s.byCampaign.length
          ? s.byCampaign.map(c => <Row key={c.name} label={`${c.name}`} value={`$${c.amount.toLocaleString()} · CPA $${c.cpa.toFixed(0)}`} />)
          : <div className="text-[11px] italic text-[#555]">No campaigns.</div>}
      </Card>
    </div>
  )
}
