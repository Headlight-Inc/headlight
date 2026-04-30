import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('socialBrand'); if (!s) return <RsEmpty mode="socialBrand" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Followers',  value: o.followersTotal.toLocaleString() },
        { label: 'Mentions',   value: o.mentions30d ?? '—' },
        { label: 'Sentiment',  value: o.sentiment != null ? o.sentiment.toFixed(2) : '—', tone: o.sentiment != null && o.sentiment < 0 ? 'warn' : 'good' },
        { label: 'Engagement', value: o.engagementRatePct != null ? `${o.engagementRatePct.toFixed(2)}%` : '—' },
      ]} columns={2} />
      <Card>
        <SectionTitle>Social traffic</SectionTitle>
        <Row label="Sessions" value={o.socialTraffic.sessions} />
        <Row label="% of site" value={`${o.socialTraffic.sitePctOfTotal.toFixed(1)}%`} />
        {o.sovPct != null && <Row label="Share of voice" value={`${o.sovPct.toFixed(1)}%`} />}
      </Card>
      {o.topPostThisWeek && (
        <Card>
          <SectionTitle>Top post this week</SectionTitle>
          <Row label={o.topPostThisWeek.platform} value={o.topPostThisWeek.preview} />
        </Card>
      )}
      {o.alerts.length > 0 && (
        <Card>
          <SectionTitle>Alerts</SectionTitle>
          {o.alerts.map((a, i) => <Row key={i} label={a.label} value={a.tone} tone={a.tone} />)}
        </Card>
      )}
    </>
  )
}
