import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Scores() {
  const s = useRsStats('fullAudit')
  if (!s) return <RsEmpty mode="fullAudit" />
  return (
    <>
      <Card>
        <SectionTitle>Subscores</SectionTitle>
        <ScoreBreakdown parts={s.subscores.map(x => ({ label: x.label, weight: 1 / s.subscores.length, value: x.value }))} />
      </Card>
      <Card>
        <SectionTitle>Score distribution</SectionTitle>
        <Histogram bins={s.scoreDistribution} />
        {s.cohortPercentile != null && <Row label="Industry percentile" value={`${Math.round(s.cohortPercentile)}th`} />}
      </Card>
      <Card>
        <SectionTitle>Movers</SectionTitle>
        <Row label="Pages improved" value={s.scoreMovers.up} />
        <Row label="Pages regressed" value={s.scoreMovers.down} tone={s.scoreMovers.down ? 'warn' : undefined} />
      </Card>
    </>
  )
}
