import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('linksAuthority'); if (!s) return <RsEmpty mode="linksAuthority" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Authority', value: o.authorityScore },
        { label: 'Internal links', value: o.internal.total },
        { label: 'Ref domains',   value: o.external.domains },
        { label: 'Avg DR',         value: o.external.drAvg.toFixed(1) },
      ]} columns={2} />
      <Card>
        <SectionTitle>Internal map</SectionTitle>
        <Row label="Avg per page" value={o.internal.avgPerPage.toFixed(1)} />
        <Row label="Orphans"      value={o.internal.orphans} tone={o.internal.orphans ? 'warn' : undefined} />
        <Row label="Deep pages"   value={o.internal.deepPages} tone={o.internal.deepPages ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Anchor mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Brand',   count: o.anchorMix.brand,   tone: 'good' },
          { label: 'Exact',   count: o.anchorMix.exact,   tone: 'warn' },
          { label: 'Partial', count: o.anchorMix.partial, tone: 'good' },
          { label: 'Generic', count: o.anchorMix.generic, tone: 'neutral' },
          { label: 'URL',     count: o.anchorMix.url,     tone: 'neutral' },
          { label: 'Image',   count: o.anchorMix.image,   tone: 'neutral' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>External momentum</SectionTitle>
        <Row label="New (90d)"  value={o.external.new90d} tone="good" />
        <Row label="Lost (90d)" value={o.external.lost90d} tone={o.external.lost90d > o.external.new90d ? 'warn' : undefined} />
        <Row label="Toxic"      value={o.toxicDomains} tone={o.toxicDomains ? 'warn' : undefined} />
      </Card>
    </>
  )
}
