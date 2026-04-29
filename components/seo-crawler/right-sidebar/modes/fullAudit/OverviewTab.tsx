import React from 'react'
import { Card, Chip, Gauge, MiniRadar, Row, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit'

const SRC_CRAWL = { tier: 'scrape',        name: 'Crawler' } as const
const SRC_HEUR  = { tier: 'est',           name: 'Heuristic' } as const

export function FullOverviewTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="Site health" right={<SourceChip source={SRC_CRAWL} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overallScore} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.heroChips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>

      <Card title="Coverage radar" right={<SourceChip source={SRC_HEUR} />}>
        <div className="flex items-center justify-center">
          <MiniRadar axes={stats.radar} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {stats.radar.map(r => <Row key={r.axis} label={r.axis} value={`${r.value}`} />)}
        </div>
      </Card>

      <Card title="Top quick fixes" right={<SourceChip source={SRC_CRAWL} />}>
        <ActionsList actions={stats.actions.slice(0, 3)} />
      </Card>
    </div>
  )
}
