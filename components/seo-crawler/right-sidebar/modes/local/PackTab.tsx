import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Pack() {
  const s = useRsStats('local'); if (!s) return <RsEmpty mode="local" />
  const p = s.pack
  return (
    <>
      <Card>
        <SectionTitle>Pack ranks</SectionTitle>
        {p.keywords.slice(0, 8).map(k => (
          <Row key={k.keyword} label={k.keyword} value={k.rank != null ? `#${k.rank}` : 'not in pack'} tone={k.rank == null ? 'warn' : k.rank > 3 ? 'warn' : 'good'} />
        ))}
      </Card>
      <Card>
        <SectionTitle>Coverage</SectionTitle>
        <Row label="In-pack %"   value={`${Math.round(p.inPackPct)}%`} tone={p.inPackPct < 50 ? 'warn' : 'good'} />
        {p.geoGridSamplePct != null && <Row label="Geo-grid sample" value={`${Math.round(p.geoGridSamplePct)}%`} />}
      </Card>
      {p.competitorPresence.length > 0 && (
        <Card>
          <SectionTitle>Competitor presence</SectionTitle>
          <Histogram bins={p.competitorPresence.map(c => ({ label: c.domain, count: c.appearances, tone: 'warn' as const }))} />
        </Card>
      )}
    </>
  )
}
