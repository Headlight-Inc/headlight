import React from 'react'
import { Card, Row, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CommerceStats } from '../../../../../services/right-sidebar/commerce'
import { pct } from '../../../../../services/right-sidebar/utils'

export function CommerceSchemaTab({ stats: { schema: sc } }: RsTabProps<CommerceStats>) {
  const total = sc.withProductSchema + sc.missingSchema || 1
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Product schema">
        <Row label="With Product" value={sc.withProductSchema} tone="good" />
        <Row label="Missing"      value={sc.missingSchema}     tone={sc.missingSchema ? 'warn' : 'good'} />
        <ProgressBar value={pct(sc.withProductSchema, total)} max={100} tone={pct(sc.withProductSchema, total) >= 90 ? 'good' : 'warn'} />
      </Card>
      <Card title="Missing fields">
        <Row label="Price"        value={sc.missingPrice}        tone={sc.missingPrice        ? 'warn' : 'good'} />
        <Row label="Availability" value={sc.missingAvailability} tone={sc.missingAvailability ? 'warn' : 'good'} />
        <Row label="Reviews"      value={sc.missingReviews}      tone={sc.missingReviews      ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
