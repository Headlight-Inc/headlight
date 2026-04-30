import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Schema() {
  const s = useRsStats('ai'); if (!s) return <RsEmpty mode="ai" />
  const sc = s.schema
  return (
    <>
      <Card>
        <SectionTitle>Coverage by type</SectionTitle>
        <Histogram max={100} bins={sc.coverage.map(t => ({ label: t.type, count: Math.round(t.pct) }))} />
      </Card>
      <Card>
        <SectionTitle>Validity</SectionTitle>
        <StackedBar segments={[
          { label: 'Valid',    count: sc.validity.validPct,    tone: 'good' },
          { label: 'Warnings', count: sc.validity.warningsPct, tone: 'warn' },
          { label: 'Errors',   count: sc.validity.errorsPct,   tone: 'bad' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top errors</SectionTitle>
        <Histogram bins={sc.topErrors.map(e => ({ label: e.reason, count: e.count, tone: 'bad' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Rich-result eligibility</SectionTitle>
        <Histogram max={100} bins={sc.richEligibility.map(r => ({ label: r.type, count: Math.round(r.pct), tone: 'good' as const }))} />
      </Card>
      <Card>
        <SectionTitle>JSON-LD</SectionTitle>
        <Row label="Pages with JSON-LD" value={`${Math.round(sc.jsonLdPct)}%`} />
      </Card>
    </>
  )
}
