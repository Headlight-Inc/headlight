import React from 'react'
import { Card, Row, Histogram } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { TechnicalStats } from '../../../../../services/right-sidebar/technical'

export function TechCrawlabilityTab({ stats: { crawl: c } }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Crawlable">
        <Row label="Crawlable" value={c.crawlable} tone="good" />
        <Row label="Blocked"   value={c.blocked} tone={c.blocked ? 'bad' : 'good'} />
      </Card>
      <Card title="Depth"><Histogram bins={c.depth.map(d => ({ label: d.label, count: d.count }))} /></Card>
      <Card title="Redirects"><Row label="Pages with chains > 1 hop" value={c.redirectChains} tone={c.redirectChains ? 'warn' : 'good'} /></Card>
    </div>
  )
}
