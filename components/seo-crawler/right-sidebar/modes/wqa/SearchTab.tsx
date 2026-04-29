import React from 'react'
import { Card, Row, StackedBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function WqaSearchTab({ stats }: RsTabProps<WqaStats>) {
  const s = stats.search
  return (
    <div className="flex flex-col gap-3">
      <Card title="Indexability" right={<SourceChip source={SRC} />}>
        <Row label="Indexable"     value={s.indexable}      tone="good" />
        <Row label="Non-indexable" value={s.nonIndexable}   tone={s.nonIndexable === 0 ? 'good' : 'warn'} />
        <StackedBar segments={[
          { value: s.indexable, color: '#4ade80', label: 'indexable' },
          { value: s.nonIndexable, color: '#f87171', label: 'non-indexable' },
        ]} />
      </Card>
      <Card title="Sitemap" right={<SourceChip source={SRC} />}>
        <Row label="Pages missing from sitemap" value={s.sitemapMissing} tone={s.sitemapMissing === 0 ? 'good' : 'warn'} />
        <Row label="Total pages crawled"        value={s.sitemapTotal} />
      </Card>
      <Card title="Canonical">
        <Row label="Pages with conflicting canonicals" value={s.canonicalIssues} tone={s.canonicalIssues === 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
