import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Authors() {
  const s = useRsStats('content'); if (!s) return <RsEmpty mode="content" />
  const d = s.duplication, f = s.freshness
  return (
    <>
      <Card>
        <SectionTitle>Duplication</SectionTitle>
        <Row label="Near-dupe groups" value={d.nearDupeGroups} tone={d.nearDupeGroups ? 'warn' : undefined} />
        <Row label="Exact dupes"      value={d.exactDupes}     tone={d.exactDupes ? 'bad' : undefined} />
        <Row label="Cannibal pairs"   value={d.cannibalPairs}  tone={d.cannibalPairs ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Similarity</SectionTitle>
        <Histogram bins={d.similarityBuckets} />
      </Card>
      <Card>
        <SectionTitle>Top dupe groups</SectionTitle>
        <Histogram bins={d.topGroups.map(g => ({ label: g.label, count: g.size, tone: 'warn' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Recommendations</SectionTitle>
        <Row label="Merges"      value={d.recommendedMerges} />
        <Row label="Deprecations" value={d.recommendedDeprec} />
      </Card>
      <Card>
        <SectionTitle>Freshness</SectionTitle>
        <Histogram bins={f.recencyHistogram} />
        <Row label="Update on page" value={`${Math.round(f.updateVisibleOnPagePct)}%`} />
        <Row label="Update in schema" value={`${Math.round(f.updateInSchemaPct)}%`} />
      </Card>
    </>
  )
}
