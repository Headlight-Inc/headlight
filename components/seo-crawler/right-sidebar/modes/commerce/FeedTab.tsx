import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Feed() {
  const s = useRsStats('commerce'); if (!s) return <RsEmpty mode="commerce" />
  const f = s.feed
  if (f.source === 'none') return <RsPartial reason="No product feed connected" />
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Items',     value: f.items },
        { label: 'Approved',  value: f.approved, tone: 'good' },
        { label: 'Warnings',  value: f.warnings, tone: f.warnings ? 'warn' : undefined },
        { label: 'Errors',    value: f.errors,   tone: f.errors ? 'bad' : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>Top errors</SectionTitle>
        <Histogram bins={f.topErrors.map(e => ({ label: e.reason, count: e.count, tone: 'bad' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Site ↔ feed parity</SectionTitle>
        <Histogram max={100} bins={[
          { label: 'Price',  count: Math.round(f.parity.pricePct),  tone: f.parity.pricePct < 95 ? 'warn' : 'good' },
          { label: 'Avail.', count: Math.round(f.parity.availPct),  tone: f.parity.availPct < 95 ? 'warn' : 'good' },
          { label: 'Title',  count: Math.round(f.parity.titlePct),  tone: f.parity.titlePct < 95 ? 'warn' : 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Coverage</SectionTitle>
        <Row label="In feed"   value={f.coverage.inFeed} />
        <Row label="Site only" value={f.coverage.siteOnly} tone={f.coverage.siteOnly ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Errors trend</SectionTitle>
        <Sparkline points={f.errorTrend} width={180} height={32} />
      </Card>
    </>
  )
}
