import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Performance() {
  const s = useRsStats('uxConversion'); if (!s) return <RsEmpty mode="uxConversion" />
  const p = s.performance
  return (
    <>
      <KpiStrip tiles={[
        { label: 'LCP p75',  value: `${p.p75LcpMs}ms`, tone: p.p75LcpMs > 2500 ? 'warn' : 'good' },
        { label: 'INP p75',  value: p.p75InpMs != null ? `${p.p75InpMs}ms` : '—' },
        { label: 'CLS p75',  value: p.p75ClsScore != null ? p.p75ClsScore.toFixed(2) : '—' },
        { label: 'CWV pass', value: `${Math.round(p.cwvPassPct)}%`, tone: p.cwvPassPct < 75 ? 'warn' : 'good' },
      ]} columns={2} />
      <Card>
        <SectionTitle>LCP percentiles</SectionTitle>
        <Histogram max={Math.max(p.p95LcpMs, 4000)} bins={[
          { label: 'p50', count: p.p50LcpMs, tone: p.p50LcpMs > 2500 ? 'warn' : 'good' },
          { label: 'p75', count: p.p75LcpMs, tone: p.p75LcpMs > 2500 ? 'warn' : 'good' },
          { label: 'p95', count: p.p95LcpMs, tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Per device</SectionTitle>
        <Histogram bins={p.perDevice.map(d => ({ label: d.device, count: d.lcpMs, tone: d.lcpMs > 2500 ? 'warn' : 'good' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Pages at risk</SectionTitle>
        <Row label="Slow pages"  value={p.slowPages}  tone={p.slowPages ? 'warn' : undefined} />
        <Row label="Heavy pages" value={p.heavyPages} tone={p.heavyPages ? 'warn' : undefined} />
      </Card>
    </>
  )
}
