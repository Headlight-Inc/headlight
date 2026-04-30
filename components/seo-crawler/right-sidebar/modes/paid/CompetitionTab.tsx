import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Competition() {
  const s = useRsStats('paid'); if (!s) return <RsEmpty mode="paid" />
  const c = s.competition
  return (
    <>
      <Card>
        <SectionTitle>Auction matrix</SectionTitle>
        <AuctionMatrix rows={c.rows} />
      </Card>
      <Card>
        <SectionTitle>Impression share lost</SectionTitle>
        <Histogram max={100} bins={[
          { label: 'Rank',     count: Math.round(c.impressionShareLost.rank),     tone: 'warn' },
          { label: 'Budget',   count: Math.round(c.impressionShareLost.budget),   tone: 'warn' },
          { label: 'Ad rank',  count: Math.round(c.impressionShareLost.adRank),   tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Share of voice trend</SectionTitle>
        <Sparkline points={c.sovTrend} width={180} height={32} />
      </Card>
    </>
  )
}
