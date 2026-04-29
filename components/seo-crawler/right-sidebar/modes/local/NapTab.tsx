// modes/local/NapTab.tsx
import React from 'react'
import { Card, Row, MiniBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function LocalNapTab({ stats }: RsTabProps<LocalStats>) {
  const n = stats.nap
  return (
    <div className="flex flex-col gap-3">
      <Card title="NAP coverage" right={<SourceChip source={SRC} />}>
        <Row label="Pages with name"    value={n.pagesWithName} />
        <Row label="Pages with address" value={n.pagesWithAddress} />
        <Row label="Pages with phone"   value={n.pagesWithPhone} />
        <Row label="With LocalBusiness schema" value={n.pagesWithLocalBusinessSchema} />
      </Card>
      <Card title="Consistency">
        <Row label="NAP triple match" value={`${n.consistencyPct}%`} tone={n.consistencyPct >= 90 ? 'good' : 'warn'} />
        <MiniBar value={n.consistencyPct} max={100} tone={n.consistencyPct >= 90 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
