import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('content'); if (!s) return <RsEmpty mode="content" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Score',     value: o.score },
        { label: 'Pages',     value: o.pages },
        { label: 'Avg words', value: o.avgWords },
        { label: 'Total wds', value: o.totalWords.toLocaleString() },
      ]} columns={2} />
      <Card>
        <SectionTitle>Categories</SectionTitle>
        <Histogram bins={o.categoryMix.map(c => ({ label: c.label, count: c.count }))} />
      </Card>
      <Card>
        <SectionTitle>Languages</SectionTitle>
        <Histogram bins={o.languages.map(l => ({ label: l.lang, count: l.count }))} />
      </Card>
      <Card>
        <SectionTitle>Schema coverage</SectionTitle>
        <Histogram max={100} bins={o.schemaCoverage.map(s2 => ({ label: s2.type, count: Math.round(s2.pct) }))} />
      </Card>
      <Card>
        <SectionTitle>Top gaps</SectionTitle>
        <Histogram bins={o.topGaps.map(g => ({ label: g.label, count: g.count, tone: 'warn' as const }))} />
      </Card>
    </>
  )
}
