import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Internal() {
  const s = useRsStats('linksAuthority'); if (!s) return <RsEmpty mode="linksAuthority" />
  const i = s.internal
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Edges',     value: i.uniqueEdges },
        { label: 'Density',   value: i.density.toFixed(2) },
        { label: 'Hubs',      value: i.hubSpoke.hubs },
        { label: 'Weak hubs', value: i.hubSpoke.weakHubs, tone: i.hubSpoke.weakHubs ? 'warn' : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>In-links distribution</SectionTitle>
        <Row label="p50" value={i.inLinks.p50} />
        <Row label="p90" value={i.inLinks.p90} />
        <Row label="p99" value={i.inLinks.p99} />
        <Row label="Orphans" value={i.inLinks.orphans} tone={i.inLinks.orphans ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Anchor distribution</SectionTitle>
        <StackedBar segments={[
          { label: 'Exact',   count: i.anchorDist.exact,   tone: 'warn' },
          { label: 'Partial', count: i.anchorDist.partial, tone: 'good' },
          { label: 'Brand',   count: i.anchorDist.brand,   tone: 'good' },
          { label: 'Generic', count: i.anchorDist.generic, tone: 'neutral' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Hub ↔ spoke</SectionTitle>
        <Row label="Hub → spoke %" value={`${Math.round(i.hubSpoke.hubToSpokePct)}%`} />
        <Row label="Spoke → hub %" value={`${Math.round(i.hubSpoke.spokeToHubPct)}%`} />
      </Card>
      <Card>
        <SectionTitle>Health</SectionTitle>
        <Row label="Broken internal" value={i.brokenInternal} tone={i.brokenInternal ? 'bad' : undefined} />
      </Card>
    </>
  )
}
