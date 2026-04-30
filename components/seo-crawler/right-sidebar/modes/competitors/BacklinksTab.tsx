import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Backlinks() {
  const s = useRsStats('competitors'); if (!s) return <RsEmpty mode="competitors" />
  const b = s.backlinks
  return (
    <>
      <Card>
        <SectionTitle>Domain overlap</SectionTitle>
        <StackedBar segments={[
          { label: 'All',     count: b.overlap.all,     tone: 'good' },
          { label: 'Us+A',    count: b.overlap.usAndA },
          { label: 'Us+B',    count: b.overlap.usAndB },
          { label: 'A+B',     count: b.overlap.aAndB,   tone: 'warn' },
          { label: 'Us only', count: b.overlap.usOnly,  tone: 'good' },
          { label: 'A only',  count: b.overlap.aOnly,   tone: 'warn' },
          { label: 'B only',  count: b.overlap.bOnly,   tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Competitor-only by DR</SectionTitle>
        <Histogram bins={b.competitorOnlyDomains.map(d => ({ label: d.drBucket, count: d.count, tone: 'warn' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Common referrers</SectionTitle>
        <Histogram max={100} bins={b.commonReferrers.slice(0, 6).map(r => ({ label: r.domain, count: r.dr, tone: 'good' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Anchor brand %</SectionTitle>
        <Histogram max={100} bins={b.anchorComparison.map(a => ({ label: a.domain, count: Math.round(a.brandPct) }))} />
      </Card>
    </>
  )
}
