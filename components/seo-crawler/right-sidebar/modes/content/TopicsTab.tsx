import React from 'react'
import { Card, Row, Bar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { ContentStats } from '@/services/right-sidebar/content'

const SRC_AI = { tier: 'ai', name: 'Topic extractor' } as const

export function ContentTopicsTab({ stats }: RsTabProps<ContentStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="Top topics" right={<SourceChip source={SRC_AI} />}>
        <Bar data={stats.topics.map(t => ({ label: t.topic, value: t.count }))} />
      </Card>
      <Card title="Top keywords" right={<SourceChip source={SRC_AI} />}>
        {stats.keywords.map(k => <Row key={k.term} label={k.term} value={k.count} />)}
      </Card>
    </div>
  )
}
