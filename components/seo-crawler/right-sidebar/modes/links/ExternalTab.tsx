import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function External() {
  const s = useRsStats('linksAuthority'); if (!s) return <RsEmpty mode="linksAuthority" />
  const e = s.external
  if (!e.domains) return <RsPartial reason="Backlink connector not configured" />
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Domains', value: e.domains },
        { label: 'Links',   value: e.links },
        { label: 'New 90d', value: e.new90d, tone: 'good' },
        { label: 'Lost 90d',value: e.lost90d, tone: e.lost90d > e.new90d ? 'warn' : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>DR distribution</SectionTitle>
        <Histogram bins={e.drBuckets} />
      </Card>
      <Card>
        <SectionTitle>Follow mix</SectionTitle>
        <StackedBar segments={[
          { label: 'follow',    count: e.followMix.follow,    tone: 'good' },
          { label: 'nofollow',  count: e.followMix.nofollow,  tone: 'neutral' },
          { label: 'ugc',       count: e.followMix.ugc,       tone: 'neutral' },
          { label: 'sponsored', count: e.followMix.sponsored, tone: 'neutral' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top referrers</SectionTitle>
        <Histogram bins={e.topReferrers.map(r => ({ label: r.domain, count: r.dr, tone: 'good' as const }))} max={100} />
      </Card>
      <Card>
        <SectionTitle>Target mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Home',    count: e.targetMix.home },
          { label: 'Blog',    count: e.targetMix.blog },
          { label: 'Product', count: e.targetMix.product },
          { label: 'Other',   count: e.targetMix.other },
        ]} />
      </Card>
    </>
  )
}
