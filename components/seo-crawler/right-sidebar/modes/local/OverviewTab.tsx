import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('local'); if (!s) return <RsEmpty mode="local" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Score',     value: o.score },
        { label: 'Locations', value: `${o.locations.verified}/${o.locations.total}` },
        { label: 'Rating',    value: o.rating.avg != null ? `${o.rating.avg.toFixed(2)} (${o.rating.totalReviews})` : '—' },
        { label: 'Pack %',    value: o.packPresencePct != null ? `${Math.round(o.packPresencePct)}%` : '—' },
      ]} columns={2} />
      <Card>
        <SectionTitle>NAP consistency</SectionTitle>
        <Histogram max={o.napConsistency.total} bins={[{ label: 'OK', count: o.napConsistency.ok, tone: 'good' }, { label: 'Issues', count: o.napConsistency.total - o.napConsistency.ok, tone: 'warn' }]} />
      </Card>
      {o.territoryCoverage.length > 0 && (
        <Card>
          <SectionTitle>Territory coverage</SectionTitle>
          <Histogram max={100} bins={o.territoryCoverage.map(t => ({ label: t.region, count: Math.round(t.pct) }))} />
        </Card>
      )}
    </>
  )
}
