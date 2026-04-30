import React from 'react'
import { Card, KpiStrip, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CommerceStats } from '../../../../../services/right-sidebar/commerce'

export function CommerceOverviewTab({ stats: s }: RsTabProps<CommerceStats>) {
  if (s.source === 'none') return <RsPartial title="No commerce data" reason="Connect Merchant Center or Shopify, or crawl pages with Product schema." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Catalogue" right={<FreshnessChip at={s.fetchedAt} />}>
        <KpiStrip columns={2} tiles={[
          { label: 'Products',     value: s.overview.products.toLocaleString() },
          { label: 'Out of stock', value: s.overview.outOfStock,            tone: s.overview.outOfStock ? 'bad' : 'good' },
          { label: 'Low stock',    value: s.overview.lowStock,              tone: s.overview.lowStock ? 'warn' : 'good' },
          { label: 'Price errors', value: s.overview.priceErrors,           tone: s.overview.priceErrors ? 'bad' : 'good' },
        ]} />
      </Card>
      {(s.overview.itemsRevenue != null || s.overview.aov != null) && (
        <Card title="Revenue (30d)">
          <KpiStrip columns={2} tiles={[
            { label: 'Items revenue', value: s.overview.itemsRevenue != null ? `$${s.overview.itemsRevenue.toLocaleString()}` : '—' },
            { label: 'AOV',           value: s.overview.aov != null ? `$${s.overview.aov.toFixed(0)}` : '—' },
          ]} />
        </Card>
      )}
    </div>
  )
}
