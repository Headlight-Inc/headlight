import React from 'react'
import { Card, Row, StackedBar, SourceChip, FreshnessChip, ago } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

const SRC_CRAWL  = { tier: 'scrape', name: 'Crawler' } as const
const SRC_ROBOTS = { tier: 'free-api', name: 'robots.txt' } as const

export function TechIndexingTab({ stats }: RsTabProps<TechnicalStats>) {
  const i = stats.indexing
  return (
    <div className="flex flex-col gap-3">
      <Card title="Indexable" right={<SourceChip source={SRC_CRAWL} />}>
        <Row label="Indexable"           value={i.indexable} />
        <Row label="Noindex"             value={i.noindex} tone={i.noindex === 0 ? 'good' : 'warn'} />
        <Row label="Canonical conflicts" value={i.canonicalConflicts} tone={i.canonicalConflicts === 0 ? 'good' : 'warn'} />
        <StackedBar segments={[
          { value: i.indexable, color: '#4ade80', label: 'indexable' },
          { value: i.noindex,   color: '#fbbf24', label: 'noindex' },
        ]} />
      </Card>
      <Card title="Sitemap" right={<SourceChip source={SRC_CRAWL} />}>
        <Row label="Coverage" value={`${i.sitemapCoveragePct}%`} tone={i.sitemapCoveragePct >= 80 ? 'good' : 'warn'} />
        <Row label="In sitemap / total" value={`${i.sitemapPresent} / ${i.sitemapTotal}`} />
      </Card>
      <Card title="Robots" right={<><SourceChip source={SRC_ROBOTS} /><FreshnessChip at={i.robotsParsedAt} /></>}>
        <Row label="Disallow rules" value={i.robotsDisallows} />
        <Row label="Last parsed"    value={i.robotsParsedAt ? ago(i.robotsParsedAt) : '—'} />
      </Card>
    </div>
  )
}
