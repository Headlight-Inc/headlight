import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Content() {
  const s = useRsStats('competitors'); if (!s) return <RsEmpty mode="competitors" />
  const w = s.wins, l = s.losses
  return (
    <>
      <Card>
        <SectionTitle>Wins</SectionTitle>
        <Row label="Keywords we own" value={w.keywordsWeOwnCount} tone="good" />
        <StackedBar segments={[
          { label: 'Brand',      count: w.defensibleMix.brand,      tone: 'good' },
          { label: 'Nav',        count: w.defensibleMix.nav,        tone: 'good' },
          { label: 'Comparison', count: w.defensibleMix.comparison, tone: 'good' },
          { label: 'Generic',    count: w.defensibleMix.generic,    tone: 'neutral' },
        ]} />
        <Histogram bins={w.topWins.slice(0, 5).map(t => ({ label: t.keyword, count: 100 - t.rank, tone: 'good' as const }))} max={100} />
      </Card>
      <Card>
        <SectionTitle>Losses</SectionTitle>
        <Row label="Keywords lost" value={l.keywordsLostCount} tone={l.keywordsLostCount ? 'warn' : undefined} />
        <Histogram bins={l.topLosses.slice(0, 5).map(t => ({ label: t.keyword, count: Math.abs(t.deltaPositions), tone: 'warn' as const }))} />
        <Histogram bins={l.winners.slice(0, 5).map(w2 => ({ label: w2.domain, count: w2.count, tone: 'warn' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Recovery potential</SectionTitle>
        <StackedBar segments={[
          { label: 'High', count: l.recoveryPotential.high, tone: 'good' },
          { label: 'Med',  count: l.recoveryPotential.med,  tone: 'warn' },
          { label: 'Low',  count: l.recoveryPotential.low,  tone: 'neutral' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Trends</SectionTitle>
        <Sparkline points={w.trend} width={180} height={28} />
        <Sparkline points={l.trend} width={180} height={28} />
      </Card>
    </>
  )
}
