import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Reviews() {
  const s = useRsStats('local'); if (!s) return <RsEmpty mode="local" />
  const r = s.reviews
  return (
    <>
      <Card>
        <SectionTitle>Sources</SectionTitle>
        {r.sources.map(src => <Row key={src.source} label={src.source} value={`${src.rating.toFixed(2)} · ${src.count}`} />)}
      </Card>
      <Card>
        <SectionTitle>Sentiment</SectionTitle>
        <StackedBar segments={[
          { label: 'Positive', count: r.sentimentDist.positive, tone: 'good' },
          { label: 'Neutral',  count: r.sentimentDist.neutral,  tone: 'neutral' },
          { label: 'Negative', count: r.sentimentDist.negative, tone: 'bad' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Response</SectionTitle>
        <Row label="Last 30d"          value={r.last30dCount ?? '—'} />
        <Row label="Avg response"      value={r.avgResponseTimeHr != null ? `${r.avgResponseTimeHr.toFixed(1)}h` : '—'} tone={r.avgResponseTimeHr != null && r.avgResponseTimeHr > 24 ? 'warn' : 'good'} />
        <Row label="Unanswered"        value={r.unansweredCount} tone={r.unansweredCount ? 'warn' : undefined} />
      </Card>
      {r.topTopics.length > 0 && (
        <Card>
          <SectionTitle>Topics</SectionTitle>
          {r.topTopics.slice(0, 5).map(t => <Row key={t.label} label={t.label} value={`${t.count} · ${t.sentiment.toFixed(2)}`} tone={t.sentiment < 0 ? 'warn' : 'good'} />)}
        </Card>
      )}
    </>
  )
}
