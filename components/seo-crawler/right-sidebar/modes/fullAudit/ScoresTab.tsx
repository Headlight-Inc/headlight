import React from 'react'
import { Card, Histogram, Row, ScoreBreakdown } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { FullAuditStats } from '../../../../../services/right-sidebar/fullAudit'

export function FullScoresTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Subscores">
        <ScoreBreakdown parts={stats.subscores.map(s => ({ label: s.label, weight: 1 / stats.subscores.length, value: s.value }))} />
      </Card>
      <Card title="Score distribution">
        <Histogram bins={stats.scoreDistribution.map(b => ({ label: b.label, count: b.count }))} />
        {stats.cohortPercentile != null && <Row label="Industry percentile" value={`${Math.round(stats.cohortPercentile)}th`} />}
      </Card>
      <Card title="Movers">
        <Row label="Pages improved"  value={stats.scoreMovers.up} tone="good" />
        <Row label="Pages regressed" value={stats.scoreMovers.down} tone={stats.scoreMovers.down ? 'bad' : 'good'} />
      </Card>
    </div>
  )
}
