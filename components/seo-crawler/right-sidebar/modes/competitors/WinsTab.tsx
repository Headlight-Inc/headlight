import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CompetitorsStats } from '../../../../../services/right-sidebar/competitors'

export function CompWinsTab({ stats: { wins: w } }: RsTabProps<CompetitorsStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Top movers">
        {w.topMovers.length
          ? w.topMovers.slice(0, 6).map(m => <Row key={m.keyword} label={m.keyword} value={`+${m.delta}`} tone="good" />)
          : <div className="text-[11px] italic text-[#555]">No movers.</div>}
      </Card>
      <Card title="Keywords won">
        {w.keywordsWon.length
          ? w.keywordsWon.slice(0, 8).map(k => <Row key={k.keyword} label={k.keyword} value={`#${k.oldPos} → #${k.newPos}`} tone="good" />)
          : <div className="text-[11px] italic text-[#555]">No wins yet.</div>}
      </Card>
    </div>
  )
}
