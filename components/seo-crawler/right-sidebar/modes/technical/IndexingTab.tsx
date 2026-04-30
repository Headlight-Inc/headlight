import React from 'react'
import { Card, Row, StackedBar, ProgressBar, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { TechnicalStats } from '../../../../../services/right-sidebar/technical'

export function TechIndexingTab({ stats: { indexing: i } }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Indexable">
        <Row label="Indexable"           value={i.indexable} />
        <Row label="Noindex"             value={i.noindex} tone={i.noindex === 0 ? 'good' : 'warn'} />
        <Row label="Canonical conflicts" value={i.canonicalConflicts} tone={i.canonicalConflicts === 0 ? 'good' : 'warn'} />
        <StackedBar segments={[
          { label: 'Indexable', count: i.indexable, tone: 'good' },
          { label: 'Noindex',   count: i.noindex,   tone: 'warn' },
        ]} />
      </Card>
      <Card title="Sitemap">
        <Row label="Coverage"          value={`${i.sitemapCoveragePct}%`} tone={i.sitemapCoveragePct >= 80 ? 'good' : 'warn'} />
        <ProgressBar value={i.sitemapCoveragePct} max={100} />
        <Row label="In sitemap / total" value={`${i.sitemapPresent} / ${i.sitemapTotal}`} />
      </Card>
      <Card title="Robots.txt" right={<FreshnessChip at={i.robotsParsedAt} />}>
        <Row label="Disallow rules" value={i.robotsDisallows} />
      </Card>
    </div>
  )
}
