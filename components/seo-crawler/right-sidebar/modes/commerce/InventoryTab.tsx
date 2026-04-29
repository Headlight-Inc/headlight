import React from 'react'
import { Card, Row, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function CommerceInventoryTab({ stats }: RsTabProps<CommerceStats>) {
  const i = stats.inventory
  return (
    <Card title="Inventory" right={<SourceChip source={SRC} />}>
      <Row label="Product pages (PDPs)" value={i.productPages} />
      <Row label="Out of stock"          value={i.oosPages}        tone={i.oosPages === 0 ? 'good' : 'warn'} />
      <Row label="With price"            value={i.pricedPages}     tone={i.pricedPages === i.productPages ? 'good' : 'warn'} />
      <Row label="Broken images"         value={i.brokenImages}    tone={i.brokenImages === 0 ? 'good' : 'bad'} />
      <Row label="Avg images / product"  value={i.avgImagesPerProduct} />
    </Card>
  )
}
