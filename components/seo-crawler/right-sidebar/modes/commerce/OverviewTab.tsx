import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('commerce'); if (!s) return <RsEmpty mode="commerce" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Score',     value: o.score },
        { label: 'Products',  value: o.catalog.products },
        { label: 'In stock %',value: `${Math.round((o.availability.inStock / Math.max(1, o.availability.inStock + o.availability.out + o.availability.preorder + o.availability.unknown)) * 100)}%` },
        { label: 'Schema valid', value: `${Math.round(o.schemaValidPct)}%` },
      ]} columns={2} />
      <Card>
        <SectionTitle>Catalog</SectionTitle>
        <Row label="Products"    value={o.catalog.products} />
        <Row label="Collections" value={o.catalog.collections} />
        <Row label="Templates"   value={o.catalog.templates} />
      </Card>
      <Card>
        <SectionTitle>Availability</SectionTitle>
        <StackedBar segments={[
          { label: 'In stock', count: o.availability.inStock,  tone: 'good' },
          { label: 'Pre',      count: o.availability.preorder, tone: 'neutral' },
          { label: 'Out',      count: o.availability.out,      tone: 'warn' },
          { label: 'Unknown',  count: o.availability.unknown,  tone: 'neutral' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Search performance</SectionTitle>
        <Row label="Clicks"    value={o.searchPerf.clicks} />
        <Row label="Purchases" value={o.searchPerf.purchases} />
        <Row label="Conv %"    value={`${o.searchPerf.convPct.toFixed(1)}%`} />
        <Row label="AOV"       value={`$${o.searchPerf.aov.toFixed(2)}`} />
      </Card>
      <Card>
        <SectionTitle>Top issues</SectionTitle>
        <Histogram bins={o.topIssues.map(i => ({ label: i.label, count: i.count, tone: 'warn' as const }))} />
      </Card>
    </>
  )
}
