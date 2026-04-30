import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Funnel() {
  const s = useRsStats('commerce'); if (!s) return <RsEmpty mode="commerce" />
  const f = s.funnel
  if (f.steps.length === 0) return <RsPartial reason="GA4 e-commerce not connected" />
  return (
    <>
      <Card>
        <SectionTitle>Funnel</SectionTitle>
        <FunnelBar steps={f.steps} />
      </Card>
      <Card>
        <SectionTitle>Outcomes</SectionTitle>
        <Row label="AOV"      value={`$${f.aov.toFixed(2)}`} />
        <Row label="Revenue"  value={`$${f.revenue.toLocaleString()}`} />
        <Row label="Rev/page" value={`$${f.revPerPage.toFixed(2)}`} />
      </Card>
      <Card>
        <SectionTitle>Device</SectionTitle>
        <StackedBar segments={[
          { label: 'Mobile',  count: f.deviceMix.mobile },
          { label: 'Desktop', count: f.deviceMix.desktop },
          { label: 'Tablet',  count: f.deviceMix.tablet },
        ]} />
      </Card>
      {f.biggestDrop && (
        <Card>
          <SectionTitle>Biggest drop</SectionTitle>
          <Row label={f.biggestDrop.step} value={`−${Math.round(f.biggestDrop.pct)}%`} tone="bad" />
        </Card>
      )}
      <Card>
        <SectionTitle>Template conversion</SectionTitle>
        <Histogram max={100} bins={f.templateConv.map(t => ({ label: t.template, count: Math.round(t.convPct * 10), tone: 'good' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Conv trend</SectionTitle>
        <Sparkline points={f.convTrend} width={180} height={32} />
      </Card>
    </>
  )
}
