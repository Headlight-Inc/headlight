import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { PaidStats } from '../../../../../services/right-sidebar/paid'

export function PaidCompetitionTab({ stats: { competition: c } }: RsTabProps<PaidStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Auction insights">
        {c.auctionInsights.length
          ? c.auctionInsights.slice(0, 6).map(a => (
              <Row key={a.competitor} label={a.competitor} value={`IS ${Math.round(a.impressionShare * 100)}% · PA ${Math.round(a.positionAboveRate * 100)}%`} />
            ))
          : <div className="text-[11px] italic text-[#555]">No auction insight data.</div>}
      </Card>
      <Card title="CPC vs benchmark">
        <Row label="Index" value={c.cpcVsBenchmark != null ? `${c.cpcVsBenchmark > 0 ? '+' : ''}${(c.cpcVsBenchmark * 100).toFixed(1)}%` : '—'} tone={(c.cpcVsBenchmark ?? 0) <= 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
