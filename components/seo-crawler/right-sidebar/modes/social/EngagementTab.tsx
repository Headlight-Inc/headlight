import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Engagement() {
  const s = useRsStats('socialBrand'); if (!s) return <RsEmpty mode="socialBrand" />
  const e = s.engagement
  return (
    <>
      <Card>
        <SectionTitle>Best time</SectionTitle>
        <BestTimeHeatmap buckets={e.bestTime.buckets} hourLabels={e.bestTime.hourLabels} />
      </Card>
      <Card>
        <SectionTitle>Content type lift</SectionTitle>
        <Histogram bins={e.contentTypeLift.map(c => ({ label: c.type, count: Math.round(c.ratePct * 10) }))} />
      </Card>
      <Card>
        <SectionTitle>Trend (12w)</SectionTitle>
        <Sparkline points={e.trend12w} width={180} height={32} />
      </Card>
      <Card>
        <SectionTitle>Replies</SectionTitle>
        <Row label="Reply rate" value={e.replyRatePct != null ? `${e.replyRatePct.toFixed(1)}%` : '—'} />
        <Row label="Median reply" value={e.replyTimeMedianMin != null ? `${e.replyTimeMedianMin}m` : '—'} />
      </Card>
      <Card>
        <SectionTitle>Hashtags</SectionTitle>
        <Histogram bins={e.hashtagPerformance.slice(0, 6).map(h => ({ label: `#${h.tag}`, count: Math.round(h.ratePct * 10) }))} />
      </Card>
      <Card>
        <SectionTitle>Audience</SectionTitle>
        <StackedBar segments={e.audience.role.map(r => ({ label: r.label, count: r.pct }))} />
      </Card>
    </>
  )
}
