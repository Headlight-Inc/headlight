import React from 'react'
import { Card, Row, Histogram, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CommerceStats } from '../../../../../services/right-sidebar/commerce'

export function CommerceFeedTab({ stats: { feed: f } }: RsTabProps<CommerceStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Feed" right={<FreshnessChip at={f.lastSync} />}>
        <Row label="Items"    value={f.feedItems} />
        <Row label="Errors"   value={f.feedErrors}   tone={f.feedErrors   ? 'bad'  : 'good'} />
        <Row label="Warnings" value={f.feedWarnings} tone={f.feedWarnings ? 'warn' : 'good'} />
      </Card>
      <Card title="Top error reasons">
        {f.topErrorReasons.length
          ? <Histogram bins={f.topErrorReasons.map(r => ({ label: r.label, count: r.count, tone: 'bad' as const }))} />
          : <div className="text-[11px] italic text-[#555]">No feed errors.</div>}
      </Card>
    </div>
  )
}
