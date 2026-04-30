import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CompetitorsStats } from '../../../../../services/right-sidebar/competitors'

export function CompLossesTab({ stats: { losses: l } }: RsTabProps<CompetitorsStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Top declines">
        {l.topDeclines.length
          ? l.topDeclines.slice(0, 6).map(d => <Row key={d.keyword} label={d.keyword} value={`${d.delta}`} tone="bad" />)
          : <div className="text-[11px] italic text-[#555]">No declines.</div>}
      </Card>
      <Card title="Keywords lost">
        {l.keywordsLost.length
          ? l.keywordsLost.slice(0, 8).map(k => <Row key={k.keyword} label={k.keyword} value={`#${k.oldPos} → #${k.newPos}`} tone="bad" />)
          : <div className="text-[11px] italic text-[#555]">No losses.</div>}
      </Card>
    </div>
  )
}
