import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CommerceStats } from '../../../../../services/right-sidebar/commerce'

export function CommerceInventoryTab({ stats: { inventory: i } }: RsTabProps<CommerceStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Inventory health">
        <Row label="Total SKUs"     value={i.totalSkus} />
        <Row label="Out of stock"   value={i.outOfStock}     tone={i.outOfStock     ? 'bad'  : 'good'} />
        <Row label="Low stock"      value={i.lowStock}       tone={i.lowStock       ? 'warn' : 'good'} />
        <Row label="Oversold"       value={i.oversold}       tone={i.oversold       ? 'bad'  : 'good'} />
        <Row label="Stale listings" value={i.staleListings}  tone={i.staleListings  ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
