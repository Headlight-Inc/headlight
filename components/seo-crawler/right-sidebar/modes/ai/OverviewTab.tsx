import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('ai'); if (!s) return <RsEmpty mode="ai" />
  return (
    <>
      <KpiStrip tiles={[
        { label: 'AI score',    value: s.overall.score },
        { label: 'Cited share', value: s.citations.source !== 'none' ? `${Math.round(s.citations.sharePct.us)}%` : '—' },
        { label: 'Schema valid',value: `${Math.round(s.schema.validity.validPct)}%` },
        { label: 'JSON-LD %',   value: `${Math.round(s.schema.jsonLdPct)}%` },
      ]} columns={2} />
      <Card>
        <SectionTitle>Signals</SectionTitle>
        {s.overall.chips.map(c => <Row key={c.label} label={c.label} value={c.value} tone={c.tone} />)}
      </Card>
    </>
  )
}
