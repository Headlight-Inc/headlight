import React from 'react'
import { Card, Row, MiniBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function AiSchemaTab({ stats }: RsTabProps<AiStats>) {
  const s = stats.schema
  const row = (label: string, v: number) => (
    <div key={label} className="mb-2 last:mb-0">
      <Row label={label} value={`${v}%`} tone={v >= 30 ? 'good' : 'warn'} />
      <MiniBar value={v} max={100} tone={v >= 30 ? 'good' : 'warn'} />
    </div>
  )
  return (
    <Card title="Structured data coverage" right={<SourceChip source={{ tier: 'scrape', name: 'Crawler' }} />}>
      {row('FAQ',    s.faqCoveragePct)}
      {row('HowTo',  s.howtoCoveragePct)}
      {row('Article', s.articleCoveragePct)}
      {row('Product', s.productCoveragePct)}
    </Card>
  )
}
