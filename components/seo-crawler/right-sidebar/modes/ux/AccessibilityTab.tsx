import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Accessibility() {
  const s = useRsStats('uxConversion'); if (!s) return <RsEmpty mode="uxConversion" />
  const a = s.accessibility
  return (
    <>
      <Card>
        <SectionTitle>Coverage</SectionTitle>
        <Histogram max={100} bins={[
          { label: 'Alt %', count: Math.round(a.altCoveragePct), tone: a.altCoveragePct < 90 ? 'warn' : 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top errors</SectionTitle>
        <Histogram bins={[
          { label: 'Contrast',  count: a.contrastErrors, tone: 'warn' },
          { label: 'Label',     count: a.labelMissing,   tone: 'warn' },
          { label: 'Landmark',  count: a.landmarkErrors, tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Patterns</SectionTitle>
        <Row label="Keyboard nav"  value={a.keyboardNavPass ? 'pass' : 'fail'}  tone={a.keyboardNavPass ? 'good' : 'bad'} />
        <Row label="Focus visible" value={a.focusVisiblePass ? 'pass' : 'fail'} tone={a.focusVisiblePass ? 'good' : 'bad'} />
      </Card>
    </>
  )
}
