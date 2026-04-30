import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Issues() {
  const s = useRsStats('fullAudit')
  if (!s) return <RsEmpty mode="fullAudit" />
  return (
    <>
      <Card>
        <SectionTitle>Severity</SectionTitle>
        <StackedBar segments={s.severityMix} />
        <Row label="New · Resolved" value={`${s.issuesNewVsResolved.newCount} · ${s.issuesNewVsResolved.resolved}`} />
      </Card>
      <Card>
        <SectionTitle>By category</SectionTitle>
        <Histogram bins={s.issueCategoryMix} />
      </Card>
      <Card>
        <SectionTitle>Top issues</SectionTitle>
        <Histogram bins={s.topIssues} />
      </Card>
    </>
  )
}
