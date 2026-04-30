import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function MarketShare() {
  const s = useRsStats('competitors'); if (!s) return <RsEmpty mode="competitors" />
  const g = s.gaps
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Shared gaps',   value: g.sharedGaps,                          tone: g.sharedGaps ? 'warn' : 'good' },
        { label: 'Combined CTR/mo', value: g.estCombinedClicksPerMo.toLocaleString() },
      ]} columns={2} />
      <Card>
        <SectionTitle>By topic</SectionTitle>
        <Histogram bins={g.byTopic.map(t => ({ label: t.topic, count: t.count, tone: 'warn' as const }))} />
      </Card>
      <Card>
        <SectionTitle>By intent</SectionTitle>
        <StackedBar segments={g.byIntent.map(i => ({ label: i.label, count: i.pct }))} />
      </Card>
      <Card>
        <SectionTitle>Volume</SectionTitle>
        <Histogram bins={g.volumeBuckets} />
      </Card>
    </>
  )
}
