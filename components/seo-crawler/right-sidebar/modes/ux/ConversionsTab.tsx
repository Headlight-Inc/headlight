import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Conversions() {
  const s = useRsStats('uxConversion'); if (!s) return <RsEmpty mode="uxConversion" />
  const c = s.conversions
  if (c.funnels.length === 0) return <RsPartial reason="GA4 / events not connected" />
  return (
    <>
      {c.funnels.slice(0, 2).map(f => (
        <Card key={f.name}>
          <SectionTitle>{f.name}</SectionTitle>
          <FunnelBar steps={f.steps} />
        </Card>
      ))}
      {c.biggestLeak && (
        <Card>
          <SectionTitle>Biggest leak</SectionTitle>
          <Row label={`${c.biggestLeak.funnel} · ${c.biggestLeak.step}`} value={`−${Math.round(c.biggestLeak.dropPct)}%`} tone="bad" />
        </Card>
      )}
      {c.formInsights.length > 0 && (
        <Card>
          <SectionTitle>Form leaks</SectionTitle>
          {c.formInsights.map(f => <Row key={f.form} label={`${f.form} · ${f.biggestLeakField}`} value={`−${Math.round(f.dropPct)}%`} tone="warn" />)}
        </Card>
      )}
    </>
  )
}
