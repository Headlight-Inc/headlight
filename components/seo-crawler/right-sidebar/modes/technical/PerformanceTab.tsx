import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Performance() {
  const s = useRsStats('technical')
  if (!s) return <RsEmpty mode="technical" />
  const r = s.render
  return (
    <>
      <Card>
        <SectionTitle>Render mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Static', count: r.mix.static, tone: 'good' },
          { label: 'SSR',    count: r.mix.ssr,    tone: 'good' },
          { label: 'CSR',    count: r.mix.csr,    tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Render gaps</SectionTitle>
        <Row label="Content invisible" value={r.gaps.contentInvisible} tone={r.gaps.contentInvisible ? 'bad' : undefined} />
        <Row label="Links invisible"   value={r.gaps.linksInvisible}   tone={r.gaps.linksInvisible ? 'bad' : undefined} />
        <Row label="Schema invisible"  value={r.gaps.schemaInvisible}  tone={r.gaps.schemaInvisible ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>CWV by template</SectionTitle>
        <Histogram bins={r.cwvTemplates.map(t => ({ label: t.template, count: t.lcpMs, tone: t.tone }))} />
      </Card>
      <Card>
        <SectionTitle>Asset load</SectionTitle>
        <Row label="JS p50"  value={r.assetLoad.jsP50  != null ? `${r.assetLoad.jsP50}ms`  : '—'} />
        <Row label="JS p90"  value={r.assetLoad.jsP90  != null ? `${r.assetLoad.jsP90}ms`  : '—'} />
        <Row label="IMG p50" value={r.assetLoad.imgP50 != null ? `${r.assetLoad.imgP50}ms` : '—'} />
        <Row label="IMG p90" value={r.assetLoad.imgP90 != null ? `${r.assetLoad.imgP90}ms` : '—'} />
        <Row label="Blocking scripts" value={r.assetLoad.blockingScripts} tone={r.assetLoad.blockingScripts ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Protocol</SectionTitle>
        <Row label="HTTP/2" value={r.http2 ? 'yes' : 'no'} tone={r.http2 ? 'good' : 'warn'} />
        <Row label="HTTP/3" value={r.http3 ? 'yes' : 'no'} tone={r.http3 ? 'good' : 'neutral'} />
      </Card>
    </>
  )
}
