import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Actions() {
  const s = useRsStats('wqa')
  if (!s) return <RsEmpty mode="wqa" />
  return (
    <>
      <Card>
        <SectionTitle>By priority</SectionTitle>
        <StackedBar segments={[
          { label: 'High',   count: s.actionsByPriority.high,   tone: 'bad' },
          { label: 'Medium', count: s.actionsByPriority.medium, tone: 'warn' },
          { label: 'Low',    count: s.actionsByPriority.low,    tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top templates</SectionTitle>
        <Histogram bins={s.topActionTemplates.map(t => ({ label: t.label, count: t.pagesAffected }))} />
      </Card>
      {s.impactForecast && (
        <Card>
          <SectionTitle>Forecast if all High shipped</SectionTitle>
          <ForecastPill f={{ label: '+Q', deltaValue: s.impactForecast.qDeltaIfHigh, unit: 'pts', confidencePct: s.impactForecast.confidencePct }} />
          <ForecastPill f={{ label: 'clicks/mo', deltaValue: s.impactForecast.clicksDeltaPerMo, unit: '', confidencePct: s.impactForecast.confidencePct }} />
        </Card>
      )}
      <Card>
        <SectionTitle>Owner load</SectionTitle>
        <Histogram bins={s.ownerLoad.map(o => ({ label: o.owner, count: o.count }))} />
      </Card>
    </>
  )
}
