import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Inventory() {
  const s = useRsStats('commerce'); if (!s) return <RsEmpty mode="commerce" />
  const i = s.inventory
  return (
    <>
      <Card>
        <SectionTitle>Status mix</SectionTitle>
        <StackedBar segments={i.statusMix} />
      </Card>
      <Card>
        <SectionTitle>Variants</SectionTitle>
        <Row label="Avg per product" value={i.variants.avg.toFixed(1)} />
        <Row label="Max" value={i.variants.max} />
        <Row label="No variants" value={i.variants.noVariants} />
      </Card>
      <Card>
        <SectionTitle>Pricing</SectionTitle>
        <Row label="Min / Avg / Max" value={`$${i.pricing.min} / $${i.pricing.avg.toFixed(0)} / $${i.pricing.max}`} />
        <Row label="On sale" value={i.pricing.onSale} />
        <Row label="Changed 24h" value={i.pricing.changed24h} />
      </Card>
      <Card>
        <SectionTitle>Dead stock</SectionTitle>
        <Row label="Zero sales 90d"      value={i.deadStock.zeroSales90d}      tone={i.deadStock.zeroSales90d ? 'warn' : undefined} />
        <Row label="Ranked, no traffic"  value={i.deadStock.rankedNoTraffic}  tone={i.deadStock.rankedNoTraffic ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>SKU delta</SectionTitle>
        <Row label="New"     value={i.skuDelta.newThisSession} tone="good" />
        <Row label="Removed" value={i.skuDelta.removed} />
        <Row label="Pareto top %" value={`${Math.round(i.paretoTopPct)}%`} />
      </Card>
    </>
  )
}
