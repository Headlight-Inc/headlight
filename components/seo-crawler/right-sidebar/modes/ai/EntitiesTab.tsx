import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Entities() {
  const s = useRsStats('ai'); if (!s) return <RsEmpty mode="ai" />
  const e = s.entities
  return (
    <>
      <Card>
        <SectionTitle>Primary entity</SectionTitle>
        <Row label="Name"       value={e.primary?.name ?? '—'} />
        <Row label="Confidence" value={e.primary ? `${Math.round(e.primary.confidencePct)}%` : '—'} />
      </Card>
      <Card>
        <SectionTitle>Anchoring</SectionTitle>
        <Row label="Organization schema" value={e.anchoring.schema} tone="good" />
        <Row label="sameAs"    value={e.anchoring.sameAs    ? 'yes' : 'no'} tone={e.anchoring.sameAs    ? 'good' : 'warn'} />
        <Row label="Wikipedia" value={e.anchoring.wikipedia ? 'yes' : 'no'} tone={e.anchoring.wikipedia ? 'good' : 'warn'} />
        <Row label="Wikidata"  value={e.anchoring.wikidata  ? 'yes' : 'no'} tone={e.anchoring.wikidata  ? 'good' : 'warn'} />
        <Row label="Crunchbase" value={e.anchoring.crunchbase ? 'yes' : 'no'} tone={e.anchoring.crunchbase ? 'good' : 'warn'} />
        <Row label="LinkedIn"   value={e.anchoring.linkedin   ? 'yes' : 'no'} tone={e.anchoring.linkedin   ? 'good' : 'warn'} />
      </Card>
      <Card>
        <SectionTitle>Authors</SectionTitle>
        <Histogram max={e.authors.total} bins={[
          { label: 'Person schema', count: e.authors.withPersonSchema, tone: 'good' },
          { label: 'Bios',          count: e.authors.withBio,          tone: 'good' },
          { label: 'sameAs',        count: e.authors.withSameAs,       tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Density</SectionTitle>
        <Row label="Avg" value={e.densityAvg.toFixed(2)} />
        <Row label="p90" value={e.densityP90.toFixed(2)} />
      </Card>
      {e.missingPeer.length > 0 && (
        <Card>
          <SectionTitle>Missing peer entities</SectionTitle>
          {e.missingPeer.slice(0, 6).map(p => <Row key={p} label={p} value="add" tone="warn" />)}
        </Card>
      )}
    </>
  )
}
