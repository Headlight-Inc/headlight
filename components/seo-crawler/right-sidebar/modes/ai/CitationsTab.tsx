import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Citations() {
  const s = useRsStats('ai'); if (!s) return <RsEmpty mode="ai" />
  const c = s.citations
  if (c.source === 'none') return <RsPartial reason="AI citations connector not configured" />
  return (
    <>
      <Card>
        <SectionTitle>Cited share</SectionTitle>
        <Waffle pct={c.sharePct.us} fillClassName="bg-fuchsia-500/70" />
        <Row label="Us" value={`${c.sharePct.us.toFixed(1)}%`} />
      </Card>
      <Card>
        <SectionTitle>vs competitors</SectionTitle>
        <Histogram max={100} bins={c.sharePct.competitors.map(x => ({ label: x.domain, count: Math.round(x.pct) }))} />
      </Card>
      <Card>
        <SectionTitle>Per model</SectionTitle>
        <Histogram max={100} bins={c.perModel.map(m => ({ label: m.model, count: Math.round(m.citedPct), tone: 'good' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Top cited pages</SectionTitle>
        <Histogram bins={c.topCitedPages.slice(0, 6).map(p => ({ label: p.url, count: p.count }))} />
      </Card>
      {c.geoVariation.length > 0 && (
        <Card>
          <SectionTitle>Geo variation</SectionTitle>
          <Histogram max={100} bins={c.geoVariation.map(g => ({ label: g.region, count: Math.round(g.pct) }))} />
        </Card>
      )}
      <Card>
        <SectionTitle>Coverage</SectionTitle>
        <Row label="Prompts in set"  value={c.promptCount} />
        <Row label="Missed prompts"  value={c.missedPrompts} tone={c.missedPrompts ? 'warn' : undefined} />
        <Row label="Runs / week"     value={c.runsPerWeek} />
      </Card>
    </>
  )
}
