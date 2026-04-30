import React from 'react'
import { Card, Row, KpiStrip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CompetitorsStats } from '../../../../../services/right-sidebar/competitors'

export function CompOverlapTab({ stats: { overlap: o } }: RsTabProps<CompetitorsStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Backlink overlap">
        <KpiStrip columns={2} tiles={[
          { label: 'Unique to comp', value: o.uniqueToCompetitors },
          { label: 'Unique to us',   value: o.uniqueToUs },
        ]} />
      </Card>
      <Card title="Shared domains">
        {o.sharedDomains.length
          ? o.sharedDomains.slice(0, 8).map(d => <Row key={d.domain} label={`${d.domain} · ${d.competitorCount} competitors`} value={d.ourLink ? '✓ ours' : 'gap'} tone={d.ourLink ? 'good' : 'warn'} />)
          : <div className="text-[11px] italic text-[#555]">No shared domain data.</div>}
      </Card>
    </div>
  )
}
