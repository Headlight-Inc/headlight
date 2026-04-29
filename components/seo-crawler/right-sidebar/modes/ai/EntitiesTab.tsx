import React from 'react'
import { Card, Row, MiniBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function AiEntitiesTab({ stats }: RsTabProps<AiStats>) {
  const e = stats.entities
  return (
    <div className="flex flex-col gap-3">
      <Card title="sameAs coverage" right={<SourceChip source={{ tier: 'scrape', name: 'Crawler' }} />}>
        <Row label="Coverage" value={`${e.sameAsCoveragePct}%`} tone={e.sameAsCoveragePct >= 50 ? 'good' : 'warn'} />
        <MiniBar value={e.sameAsCoveragePct} max={100} tone={e.sameAsCoveragePct >= 50 ? 'good' : 'warn'} />
      </Card>
      <Card title="Top entities" right={<SourceChip source={{ tier: 'ai', name: 'NER' }} />}>
        {e.detected.length === 0 && <div className="text-[10px] text-[#666] py-1">No entities detected.</div>}
        {e.detected.map(x => <Row key={x.name} label={x.name} value={x.count} />)}
      </Card>
    </div>
  )
}
