import React from 'react'
import { Card, Row, MiniBar, SourceChip, fmtTime } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function WqaTechTab({ stats }: RsTabProps<WqaStats>) {
  const t = stats.tech
  const httpsPct = t.httpsTotal === 0 ? 0 : Math.round((t.https / t.httpsTotal) * 100)
  return (
    <div className="flex flex-col gap-3">
      <Card title="Trust" right={<SourceChip source={SRC} />}>
        <Row label="HTTPS"        value={`${httpsPct}%`}              tone={httpsPct >= 95 ? 'good' : 'bad'} />
        <MiniBar value={httpsPct} max={100} tone={httpsPct >= 95 ? 'good' : 'bad'} />
      </Card>
      <Card title="Performance">
        <Row label="Avg response" value={fmtTime(t.avgResponseMs ?? null)} tone={(t.avgResponseMs ?? 0) < 800 ? 'good' : 'warn'} />
        <Row label="Slow pages (>2.5s)" value={t.slowPages}            tone={t.slowPages === 0 ? 'good' : 'warn'} />
        <Row label="Heavy pages (>2 MB)" value={t.heavyPages}          tone={t.heavyPages === 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
