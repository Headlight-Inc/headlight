import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('wqa')
  if (!s) return <RsEmpty mode="wqa" />
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Q-score',  value: s.qScore,             delta: s.qScoreDeltaPct != null ? { value: s.qScoreDeltaPct } : undefined, spark: s.qScoreSpark },
        { label: 'Pages',    value: s.pages },
        { label: 'Clicks/d', value: s.searchSnapshot.clicks ?? '—', delta: s.clicksDeltaPct != null ? { value: s.clicksDeltaPct } : undefined },
        { label: 'Issues',   value: s.issuesTotal,        delta: s.issuesDeltaPct != null ? { value: s.issuesDeltaPct, positiveIsGood: false } : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>Quality distribution</SectionTitle>
        <Histogram bins={s.qualityHistogram} />
      </Card>
      <Card>
        <SectionTitle>Needs decision</SectionTitle>
        <StackedBar segments={[
          { label: 'Rewrite',   count: s.needsDecision.rewrite,   tone: 'warn' },
          { label: 'Merge',     count: s.needsDecision.merge,     tone: 'warn' },
          { label: 'Expand',    count: s.needsDecision.expand,    tone: 'neutral' },
          { label: 'Deprecate', count: s.needsDecision.deprecate, tone: 'bad' },
        ]} />
      </Card>
    </>
  )
}
