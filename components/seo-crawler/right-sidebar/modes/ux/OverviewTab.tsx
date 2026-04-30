import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('uxConversion'); if (!s) return <RsEmpty mode="uxConversion" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Site CVR',    value: o.siteCvrPct != null ? `${o.siteCvrPct.toFixed(2)}%` : '—' },
        { label: 'Top goal',    value: o.topGoal ? o.topGoal.label : '—' },
        { label: 'Engage time', value: o.engageTimeSec != null ? `${o.engageTimeSec}s` : '—' },
        { label: 'CWV pass',    value: `${Math.round(o.cwvPassPct)}%`, tone: o.cwvPassPct < 75 ? 'warn' : 'good' },
      ]} columns={2} />
      <Card>
        <SectionTitle>Device mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Mobile',  count: o.deviceMix.mobile },
          { label: 'Desktop', count: o.deviceMix.desktop },
          { label: 'Tablet',  count: o.deviceMix.tablet },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Friction</SectionTitle>
        <Row label="Rage clicks" value={o.rageClicks} tone={o.rageClicks ? 'warn' : undefined} />
      </Card>
    </>
  )
}
