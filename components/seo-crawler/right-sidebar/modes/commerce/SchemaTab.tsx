import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function CommerceSchemaTab({ stats }: RsTabProps<CommerceStats>) {
  const s = stats.schema
  return (
    <Card title="Product schema" right={<SourceChip source={SRC} />}>
      <Row label="Coverage" value={`${s.productSchemaCoveragePct}%`} tone={s.productSchemaCoveragePct >= 80 ? 'good' : 'warn'} />
      <ProgressBar value={s.productSchemaCoveragePct} max={100} tone={s.productSchemaCoveragePct >= 80 ? 'good' : 'warn'} />
      <Row label="With price"        value={s.withPrice} />
      <Row label="With availability" value={s.withAvailability} />
      <Row label="With brand"        value={s.withBrand} />
      <Row label="With GTIN"         value={s.withGtin}    tone={s.withGtin > 0 ? 'good' : 'warn'} />
      <Row label="With ratings"      value={s.withRatings} />
    </Card>
  )
}
