import React from 'react'
import { Card, Gauge, Chip, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function AiOverviewTab({ stats }: RsTabProps<AiStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="AI readiness" right={<SourceChip source={{ tier: 'scrape', name: 'Crawler' }} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overall.score} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.overall.chips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>
      <Card title="Top fixes"><ActionsList actions={stats.actions.slice(0, 5)} /></Card>
    </div>
  )
}
