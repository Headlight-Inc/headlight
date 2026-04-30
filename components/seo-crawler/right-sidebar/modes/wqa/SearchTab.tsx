import React from 'react'
import { Card, Row, StackedBar, Histogram, FreshnessChip, SourceChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { WqaStats } from '../../../../../services/right-sidebar/wqa'

const SRC = { tier: 'authoritative', name: 'GSC' } as const
export function WqaSearchTab({ stats, deps }: RsTabProps<WqaStats>) {
  const s = stats.search
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Indexability" right={<SourceChip source={SRC} />}>
        <Row label="Indexable"     value={s.indexable}    tone="good" />
        <Row label="Non-indexable" value={s.nonIndexable} tone={s.nonIndexable === 0 ? 'good' : 'warn'} />
        <StackedBar segments={[
          { label: 'Indexable',     count: s.indexable,    tone: 'good' },
          { label: 'Non-indexable', count: s.nonIndexable, tone: 'bad'  },
        ]} />
      </Card>
      <Card title="Sitemap">
        <Row label="Pages missing from sitemap" value={s.sitemapMissing} tone={s.sitemapMissing === 0 ? 'good' : 'warn'} />
        <Row label="Total pages crawled"        value={s.sitemapTotal} />
      </Card>
      <Card title="Canonical">
        <Row label="Pages with conflicting canonicals" value={s.canonicalIssues} tone={s.canonicalIssues === 0 ? 'good' : 'warn'} />
      </Card>
      <Card title="Keyword positions" right={<FreshnessChip at={deps.integrationConnections?.gsc?.lastFetchedAt} />}>
        <Histogram bins={s.keywordBuckets.map(b => ({ label: b.label, count: b.count }))} />
      </Card>
      {(s.movers.winners.length > 0 || s.movers.losers.length > 0) && (
        <Card title="Movers (28d)">
          {s.movers.winners.slice(0, 4).map(m => <Row key={m.label} label={m.label} value={`+${m.delta}`} tone="good" />)}
          {s.movers.losers.slice(0, 4).map(m => <Row key={m.label} label={m.label} value={`${m.delta}`} tone="bad" />)}
        </Card>
      )}
    </div>
  )
}
