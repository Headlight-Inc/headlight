import React from 'react'
import { Card, KpiStrip, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LinksAuthorityStats } from '../../../../../services/right-sidebar/linksAuthority'

export function LinksExternalTab({ stats: { external: e } }: RsTabProps<LinksAuthorityStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Backlink profile">
        <KpiStrip columns={2} tiles={[
          { label: 'Ref domains', value: e.domains },
          { label: 'Backlinks',   value: e.backlinks },
          { label: 'Avg DR',      value: e.drAvg.toFixed(1) },
          { label: 'Outbound broken', value: e.outboundBroken, tone: e.outboundBroken ? 'warn' : 'good' },
        ]} />
      </Card>
      <Card title="Momentum (90d)">
        <Row label="New domains"  value={e.new90d}  tone="good" />
        <Row label="Lost domains" value={e.lost90d} tone={e.lost90d ? 'warn' : 'good'} />
      </Card>
      <Card title="Outbound">
        <Row label="Nofollow external" value={e.nofollowExternal} />
      </Card>
    </div>
  )
}
