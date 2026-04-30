import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LinksAuthorityStats } from '@/services/right-sidebar/linksAuthority'

export function LinksInternalTab({ stats }: RsTabProps<LinksAuthorityStats>) {
  const i = stats.internal
  return (
    <div className="flex flex-col gap-3">
      <Card title="Inlinks" right={<SourceChip source={ { tier: 'scrape', name: 'Crawler' } } />}>
        <Row label="Avg / page"      value={i.avgInlinks} />
        <Row label="Median"          value={i.medianInlinks} />
        <Row label="p95"             value={i.p95Inlinks} />
        <Row label="Orphan pages"    value={i.orphanPages}        tone={i.orphanPages === 0 ? 'good' : 'warn'} />
        <Row label="Pages w/ 1 inlink" value={i.pagesWithOnly1Inlink} tone={i.pagesWithOnly1Inlink === 0 ? 'good' : 'warn'} />
      </Card>
      <Card title="Depth">
        <Row label="Avg depth" value={i.avgDepth} tone={i.avgDepth <= 3 ? 'good' : 'warn'} />
        <ProgressBar value={Math.min(100, (i.avgDepth / 6) * 100)} max={100} />
      </Card>
      {stats.topInlinkPages.length > 0 && (
        <Card title="Most-linked pages">
          {stats.topInlinkPages.slice(0, 8).map(p => (
            <Row key={p.url} label={new URL(p.url).pathname} value={p.inlinks} />
          ))}
        </Card>
      )}
    </div>
  )
}
