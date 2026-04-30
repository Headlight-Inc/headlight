import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Search() {
  const s = useRsStats('wqa')
  if (!s) return <RsEmpty mode="wqa" />
  if (!s.searchSnapshot.clicks && !s.searchSnapshot.impressions) return <RsPartial reason="GSC not connected" />
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Clicks',      value: s.searchSnapshot.clicks ?? '—' },
        { label: 'Impressions', value: s.searchSnapshot.impressions ?? '—' },
        { label: 'CTR',         value: s.searchSnapshot.ctr != null ? `${(s.searchSnapshot.ctr * 100).toFixed(1)}%` : '—' },
        { label: 'Position',    value: s.searchSnapshot.position != null ? s.searchSnapshot.position.toFixed(1) : '—' },
      ]} columns={2} />
      <Card>
        <SectionTitle>Keyword buckets</SectionTitle>
        <Histogram bins={s.keywordBuckets} />
      </Card>
      <Card>
        <SectionTitle>CTR vs benchmark</SectionTitle>
        {s.ctrVsBenchmark.map(b => (
          <Row key={b.position} label={`pos ${b.position}`} value={`${(b.usPct * 100).toFixed(1)}% · bench ${(b.benchmarkPct * 100).toFixed(1)}%`} tone={b.usPct < b.benchmarkPct ? 'warn' : 'good'} />
        ))}
      </Card>
      <Card>
        <SectionTitle>Movers</SectionTitle>
        <MoverList winners={s.movers.winners} losers={s.movers.losers} />
      </Card>
    </>
  )
}
