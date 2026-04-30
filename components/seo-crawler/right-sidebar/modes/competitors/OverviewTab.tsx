import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('competitors'); if (!s) return <RsEmpty mode="competitors" />
  if (s.source === 'none') return <RsPartial reason="Backlink/keyword connector not configured" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Score',    value: o.score },
        { label: 'Gaps',     value: o.summary.gaps,    tone: o.summary.gaps   ? 'warn' : undefined },
        { label: 'Wins',     value: o.summary.wins,    tone: 'good' },
        { label: 'Losses',   value: o.summary.losses,  tone: o.summary.losses ? 'warn' : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>Share of voice</SectionTitle>
        <Histogram max={100} bins={o.sov.map(x => ({ label: x.domain, count: Math.round(x.pct) }))} />
      </Card>
      <Card>
        <SectionTitle>Keyword overlap</SectionTitle>
        <Row label="All"      value={o.keywordOverlap.all} />
        <Row label="Us only"  value={o.keywordOverlap.usOnly} tone="good" />
        {o.keywordOverlap.otherOnly.map(c => <Row key={c.domain} label={`${c.domain} only`} value={c.count} tone="warn" />)}
      </Card>
      <Card>
        <SectionTitle>Top-3 counts</SectionTitle>
        <Histogram bins={o.top3Counts.map(t => ({ label: t.domain, count: t.count }))} />
      </Card>
    </>
  )
}
