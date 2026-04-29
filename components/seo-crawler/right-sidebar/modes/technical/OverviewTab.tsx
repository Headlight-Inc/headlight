import React from 'react'
import { Card, Gauge, Chip, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function TechOverviewTab({ stats }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="Tech health" right={<SourceChip source={SRC} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overall.score} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.overall.chips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>
      <Card title="Top fixes">
        <ActionsList actions={stats.actions} max={5} />
      </Card>
    </div>
  )
}
