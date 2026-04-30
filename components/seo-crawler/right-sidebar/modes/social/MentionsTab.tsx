import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Mentions() {
  const s = useRsStats('socialBrand'); if (!s) return <RsEmpty mode="socialBrand" />
  const m = s.mentions
  return (
    <>
      <Card>
        <SectionTitle>Sentiment</SectionTitle>
        <StackedBar segments={[
          { label: 'Positive', count: m.sentimentDist.positive, tone: 'good' },
          { label: 'Neutral',  count: m.sentimentDist.neutral,  tone: 'neutral' },
          { label: 'Negative', count: m.sentimentDist.negative, tone: 'bad' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Sources</SectionTitle>
        <Histogram bins={m.sourceMix.map(s2 => ({ label: s2.source, count: Math.round(s2.pct) }))} max={100} />
      </Card>
      <Card>
        <SectionTitle>Top mentioners</SectionTitle>
        <Histogram bins={m.topMentioners.map(t => ({ label: `${t.handle} (${t.followers.toLocaleString()})`, count: t.count }))} />
      </Card>
      <Card>
        <SectionTitle>Top topics</SectionTitle>
        {m.topics.slice(0, 6).map(t => <Row key={t.label} label={t.label} value={`${t.count} · sent ${t.sentiment.toFixed(2)}`} tone={t.sentiment < 0 ? 'warn' : 'good'} />)}
      </Card>
      {m.crisisSignal && (
        <Card>
          <SectionTitle>Crisis signal</SectionTitle>
          <Row label="Description" value={m.crisisSignal.description} tone="bad" />
          <Row label="Reach est."  value={m.crisisSignal.reachEstimate.toLocaleString()} />
          <Row label="Velocity"    value={`${m.crisisSignal.velocityFactor.toFixed(1)}×`} tone="warn" />
        </Card>
      )}
    </>
  )
}
