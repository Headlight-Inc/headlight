import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('technical')
  if (!s) return <RsEmpty mode="technical" />
  const o = s.overview
  const total = o.indexableMix.total || 1
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Tech score',  value: o.score },
        { label: 'Indexable %', value: `${Math.round((o.indexableMix.indexable / total) * 100)}%` },
        { label: 'TTFB p90',    value: o.ttfb.p90 != null ? `${o.ttfb.p90}ms` : '—' },
        { label: 'CSR',         value: o.renderMix.csr },
      ]} columns={2} />
      <Card>
        <SectionTitle>Status mix</SectionTitle>
        <StackedBar segments={o.statusMix} />
      </Card>
      <Card>
        <SectionTitle>Render mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Static', count: o.renderMix.static, tone: 'good' },
          { label: 'SSR',    count: o.renderMix.ssr,    tone: 'good' },
          { label: 'CSR',    count: o.renderMix.csr,    tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top risks</SectionTitle>
        <Histogram bins={o.topRisks.map(r => ({ label: r.label, count: r.count, tone: 'warn' as const }))} />
      </Card>
    </>
  )
}
