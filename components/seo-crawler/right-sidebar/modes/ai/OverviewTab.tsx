import React from 'react'
import { Card, KpiStrip, Gauge, Chip, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { AiStats } from '../../../../../services/right-sidebar/ai'

export function AiOverviewTab({ stats: s }: RsTabProps<AiStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="AI readiness" right={<FreshnessChip at={s.fetchedAt} />}>
        <div className="flex items-center gap-3">
          <Gauge value={s.overview.aiReadiness} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            <Chip tone={s.overview.llmsTxt === 'present' ? 'good' : s.overview.llmsTxt === 'invalid' ? 'warn' : 'bad'}>llms.txt: {s.overview.llmsTxt}</Chip>
            <Chip>JSON-LD: {s.overview.jsonLdPages}</Chip>
            <Chip>OG: {s.overview.openGraphPages}</Chip>
            {s.overview.eeatScore != null && <Chip>EEAT: {s.overview.eeatScore}</Chip>}
          </div>
        </div>
      </Card>
      <Card title="Coverage">
        <KpiStrip columns={2} tiles={[
          { label: 'JSON-LD pages', value: s.overview.jsonLdPages },
          { label: 'OG pages',      value: s.overview.openGraphPages },
        ]} />
      </Card>
    </div>
  )
}
