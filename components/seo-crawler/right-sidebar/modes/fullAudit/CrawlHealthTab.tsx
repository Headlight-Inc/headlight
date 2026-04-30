import React from 'react'
import { Card, Row, ProgressBar, StackedBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { FullAuditStats } from '../../../../../services/right-sidebar/fullAudit'

export function FullCrawlHealthTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Coverage">
        <Row label="Pages"     value={stats.totals.pages.toLocaleString()} />
        <Row label="Indexable" value={stats.totals.indexable.toLocaleString()} tone="good" />
        <Row label="Broken"    value={stats.totals.broken} tone={stats.totals.broken ? 'bad' : 'good'} />
        <Row label="HTTPS"     value={stats.totals.https} tone="good" />
        <ProgressBar value={stats.sitemapCoveragePct} max={100} />
        <div className="text-[10px] text-[#666] mt-1">Sitemap coverage</div>
      </Card>
      <Card title="Response times">
        <Row label="p90" value={stats.responseP90Ms != null ? `${stats.responseP90Ms}ms` : '—'} tone={(stats.responseP90Ms ?? 0) <= 1500 ? 'good' : 'warn'} />
        <Row label="p99" value={stats.responseP99Ms != null ? `${stats.responseP99Ms}ms` : '—'} tone={(stats.responseP99Ms ?? 0) <= 3000 ? 'good' : 'warn'} />
      </Card>
      <Card title="Indexable mix">
        <StackedBar segments={[
          { label: 'Indexable',   count: stats.totals.indexable,                       tone: 'good' },
          { label: 'Non-indexable', count: stats.totals.pages - stats.totals.indexable, tone: 'warn' },
        ]} />
      </Card>
    </div>
  )
}
