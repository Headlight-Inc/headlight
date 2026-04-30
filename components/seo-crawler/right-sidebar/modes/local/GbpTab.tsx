import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Gbp() {
  const s = useRsStats('local'); if (!s) return <RsEmpty mode="local" />
  const g = s.gbp
  if (!g.primaryCategory) return <RsPartial reason="GBP not connected" />
  return (
    <>
      <Card>
        <SectionTitle>Categories</SectionTitle>
        <Row label="Primary" value={g.primaryCategory} />
        {g.additionalCategories.length > 0 && <Row label="Additional" value={g.additionalCategories.join(', ')} />}
      </Card>
      <Card>
        <SectionTitle>Profile completeness</SectionTitle>
        <Row label="Photos"           value={g.photos ?? '—'} tone={g.photos != null && g.photos < 10 ? 'warn' : 'good'} />
        <Row label="Posts (7d)"       value={g.posts7d ?? '—'} tone={g.posts7d != null && g.posts7d === 0 ? 'warn' : 'good'} />
        <Row label="Hours complete"   value={g.hoursComplete ? 'yes' : 'no'} tone={g.hoursComplete ? 'good' : 'warn'} />
        <Row label="Q&A unanswered"   value={g.qaUnanswered ?? '—'} tone={g.qaUnanswered ? 'warn' : undefined} />
        <Row label="Products/services" value={g.productServiceCount ?? '—'} />
      </Card>
    </>
  )
}
