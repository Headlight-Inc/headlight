import React from 'react'
import { Card, Chip, Gauge, MiniRadar, Row, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function WqaOverviewTab({ stats }: RsTabProps<WqaStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="Quality score" right={<SourceChip source={SRC} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overallScore} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.heroChips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>

      <Card title="Quality axes">
        <div className="flex items-center justify-center"><MiniRadar axes={stats.radar} /></div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {stats.radar.map(r => <Row key={r.axis} label={r.axis} value={`${r.value}`} />)}
        </div>
      </Card>

      <Card title="Top fixes">
        <ActionsList actions={stats.actions.slice(0, 5)} />
      </Card>
    </div>
  )
}
