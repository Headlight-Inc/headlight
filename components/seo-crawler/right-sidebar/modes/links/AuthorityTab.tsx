import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Authority() {
  const s = useRsStats('linksAuthority'); if (!s) return <RsEmpty mode="linksAuthority" />
  const a = s.authority
  return (
    <>
      <Card>
        <SectionTitle>DR trend</SectionTitle>
        <Sparkline points={a.drTrend} width={180} height={36} />
      </Card>
      <Card>
        <SectionTitle>vs competitors</SectionTitle>
        <Histogram max={100} bins={a.drVsCompetitors.map(c => ({ label: c.domain, count: c.dr, tone: 'neutral' as const }))} />
      </Card>
      <Card>
        <SectionTitle>Ref-domain growth</SectionTitle>
        {a.rdGrowth.map(w => (
          <Row key={w.week} label={w.week} value={`+${w.new} · −${w.lost}`} tone={w.lost > w.new ? 'warn' : 'good'} />
        ))}
      </Card>
    </>
  )
}
