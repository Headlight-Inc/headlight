import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Schema() {
  const s = useRsStats('commerce'); if (!s) return <RsEmpty mode="commerce" />
  const sc = s.schema
  return (
    <>
      <Card>
        <SectionTitle>Product schema coverage</SectionTitle>
        <Waffle pct={sc.productSchemaCoveragePct} />
        <Row label="Coverage" value={`${Math.round(sc.productSchemaCoveragePct)}%`} tone={sc.productSchemaCoveragePct < 90 ? 'warn' : 'good'} />
      </Card>
      <Card>
        <SectionTitle>Required fields</SectionTitle>
        <Histogram max={100} bins={sc.requiredFields.map(f => ({ label: f.field, count: Math.round(f.pct), tone: f.tone }))} />
      </Card>
      <Card>
        <SectionTitle>Collections</SectionTitle>
        <Row label="ItemList %"       value={`${Math.round(sc.collectionSchema.itemListPct)}%`} />
        <Row label="BreadcrumbList %" value={`${Math.round(sc.collectionSchema.breadcrumbListPct)}%`} />
      </Card>
      <Card>
        <SectionTitle>Rich-result eligibility</SectionTitle>
        <Row label="Product" value={sc.richResultEligibility.product} tone="good" />
        <Row label="Review"  value={sc.richResultEligibility.review}  tone="good" />
      </Card>
    </>
  )
}
