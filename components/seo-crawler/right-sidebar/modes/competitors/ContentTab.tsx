import React from 'react'
import { Card, Row, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorStats } from '@/services/right-sidebar/competitors'

export function CompContentTab({ stats }: RsTabProps<CompetitorStats>) {
  const c = stats.content
  const SRC = { tier: 'authoritative', name: stats.source } as const
  return (
    <div className="flex flex-col gap-3">
      <Card title="Benchmarking" right={<SourceChip source={{ tier: 'scrape', name: 'Crawler' }} />}>
        <Row label="Avg word count" value={c.avgWordCount} />
      </Card>
      {c.topCompetingPages.length > 0 && (
        <Card title="Top competing pages" right={<SourceChip source={SRC} />}>
          {c.topCompetingPages.slice(0, 5).map(p => (
            <Row key={p.url} label={new URL(p.url).pathname} value={`Match ${Math.round(p.score * 100)}%`} />
          ))}
        </Card>
      )}
      {c.contentGaps.length > 0 && (
        <Card title="Content gaps">
          {c.contentGaps.slice(0, 8).map(g => (
            <Row key={g.topic} label={g.topic} value={`${Math.round(g.opportunity * 100)}% opp.`} />
          ))}
        </Card>
      )}
    </div>
  )
}
