import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { AiStats } from '../../../../../services/right-sidebar/ai'

export function AiEntitiesTab({ stats: { entities: e } }: RsTabProps<AiStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Entity coverage">
        <Row label="Total entities tracked" value={e.count} />
        <Row label="sameAs coverage"        value={e.sameAsCoverage} />
      </Card>
      <Card title="Top entities">
        {e.topEntities.length
          ? e.topEntities.slice(0, 8).map(x => <Row key={x.name} label={`${x.name} · ${x.type}`} value={x.mentions} />)
          : <div className="text-[11px] italic text-[#555]">No entity data.</div>}
      </Card>
    </div>
  )
}
