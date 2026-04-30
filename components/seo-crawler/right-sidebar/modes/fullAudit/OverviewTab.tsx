import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('fullAudit')
  if (!s) return <RsEmpty mode="fullAudit" />
  return (
    <>
      <KpiStrip tiles={s.kpis} columns={2} />
      <Card>
        <SectionTitle>Status mix</SectionTitle>
        <StackedBar segments={s.statusMix} />
      </Card>
      <Card>
        <SectionTitle>Depth distribution</SectionTitle>
        <Histogram bins={s.depthHistogram} />
      </Card>
      <Card>
        <SectionTitle>Category mix</SectionTitle>
        <Donut slices={s.categoryDonut} />
      </Card>
    </>
  )
}
