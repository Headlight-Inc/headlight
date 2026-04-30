import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Integrations() {
  const s = useRsStats('fullAudit')
  if (!s) return <RsEmpty mode="fullAudit" />
  const total = s.coverage.total || 1
  return (
    <>
      <Card>
        <SectionTitle>Connections</SectionTitle>
        {s.integrations.map(i => (
          <Row key={i.name} label={i.name} value={i.connected ? `synced ${i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleDateString() : ''}` : 'not connected'} tone={i.connected ? 'good' : 'warn'} />
        ))}
      </Card>
      <Card>
        <SectionTitle>Data coverage</SectionTitle>
        <Histogram bins={[
          { label: 'GSC',       count: s.coverage.withGsc,        tone: 'good' },
          { label: 'Keywords',  count: s.coverage.withKw,         tone: 'good' },
          { label: 'Backlinks', count: s.coverage.withBacklinks,  tone: 'good' },
          { label: 'Missing',   count: total - Math.max(s.coverage.withGsc, s.coverage.withKw, s.coverage.withBacklinks), tone: 'warn' },
        ]} max={total} />
      </Card>
      {s.missingAdapters.length > 0 && (
        <Card>
          <SectionTitle>Missing adapters</SectionTitle>
          {s.missingAdapters.map(a => <Row key={a} label={a} value="connect" tone="warn" />)}
        </Card>
      )}
    </>
  )
}
