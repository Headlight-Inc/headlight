import React from 'react'
import { Card, KpiStrip, Gauge, Chip, ActionsList, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { FullAuditStats } from '../../../../../services/right-sidebar/fullAudit'

export function FullOverviewTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Site health" right={<FreshnessChip at={stats.fetchedAt} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overall.score} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.overall.chips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>
      <Card title="Headline">
        <KpiStrip columns={2} tiles={[
          { label: 'Pages',     value: stats.totals.pages.toLocaleString() },
          { label: 'Indexable', value: stats.totals.indexable.toLocaleString() },
          { label: 'Broken',    value: stats.totals.broken,    tone: stats.totals.broken ? 'bad' : 'good' },
          { label: 'In sitemap', value: `${stats.sitemapCoveragePct}%` },
        ]} />
      </Card>
      <Card title="Top fixes">
        <ActionsList actions={stats.actions} max={5} />
      </Card>
    </div>
  )
}
