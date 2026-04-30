import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Spend() {
  const s = useRsStats('paid'); if (!s) return <RsEmpty mode="paid" />
  if (s.source === 'none') return <RsPartial reason="No ads platform connected" />
  const sp = s.spend
  return (
    <>
      <Card>
        <SectionTitle>Network mix</SectionTitle>
        <StackedBar segments={sp.networkMix.map(n => ({ label: n.label, count: n.pct }))} />
      </Card>
      <Card>
        <SectionTitle>Daypart</SectionTitle>
        <BestTimeHeatmap buckets={sp.daypart.buckets} hourLabels={sp.daypart.hourLabels} />
      </Card>
      <Card>
        <SectionTitle>CPA by funnel</SectionTitle>
        <Histogram bins={sp.cpaByFunnel.map(c => ({ label: c.funnel, count: Math.round(c.cpa) }))} />
      </Card>
      <Card>
        <SectionTitle>Wasted spend</SectionTitle>
        <Row label="Irrelevant terms" value={`$${sp.wastedSpend.irrelevantTermsUsd.toLocaleString()}`} tone={sp.wastedSpend.irrelevantTermsUsd ? 'warn' : undefined} />
        <Row label="Negative-kw gap" value={`$${sp.wastedSpend.negKwGapUsd.toLocaleString()}`} tone={sp.wastedSpend.negKwGapUsd ? 'warn' : undefined} />
      </Card>
    </>
  )
}
