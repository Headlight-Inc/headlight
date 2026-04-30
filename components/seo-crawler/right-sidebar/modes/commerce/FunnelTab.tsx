import React from 'react'
import { Card, Row, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CommerceStats } from '../../../../../services/right-sidebar/commerce'

export function CommerceFunnelTab({ stats: { funnel: f } }: RsTabProps<CommerceStats>) {
  const fmt = (v: number | null) => v != null ? `${(v * 100).toFixed(1)}%` : '—'
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Funnel rates">
        <Row label="Add to cart"    value={fmt(f.addToCartRate)} />
        {f.addToCartRate != null && <ProgressBar value={f.addToCartRate * 100} max={100} />}
        <Row label="Checkout start" value={fmt(f.checkoutStartRate)} />
        {f.checkoutStartRate != null && <ProgressBar value={f.checkoutStartRate * 100} max={100} />}
        <Row label="Purchase"       value={fmt(f.purchaseRate)} />
        {f.purchaseRate != null && <ProgressBar value={f.purchaseRate * 100} max={100} />}
      </Card>
      <Card title="Cart abandonment">
        <Row label="Abandoned carts (30d)" value={f.abandonedCarts ?? '—'} tone={f.abandonedCarts ? 'warn' : undefined} />
      </Card>
    </div>
  )
}
