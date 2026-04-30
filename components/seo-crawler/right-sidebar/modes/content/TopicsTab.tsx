import React from 'react'
import { Card, Histogram, Row, StackedBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { ContentStats } from '../../../../../services/right-sidebar/content'

export function ContentTopicsTab({ stats: { topics: t } }: RsTabProps<ContentStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Top clusters"><Histogram bins={t.topClusters.map(c => ({ label: c.name, count: c.count }))} /></Card>
      <Card title="Cluster share">
        {t.topClusters.map(c => <Row key={c.name} label={c.name} value={`${c.share}% (${c.count})`} />)}
      </Card>
      <Card title="Intent mix">
        <StackedBar segments={t.intents.map(i => ({ label: i.label, count: i.count, tone: i.label === 'transactional' ? 'good' : i.label === 'commercial' ? 'good' : 'neutral' }))} />
      </Card>
      <Card title="Orphans"><Row label="Topics with only one page" value={t.orphanClusters} tone={t.orphanClusters ? 'warn' : 'good'} /></Card>
    </div>
  )
}
