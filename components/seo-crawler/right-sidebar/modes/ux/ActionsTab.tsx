import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Actions() {
  const s = useRsStats('uxConversion'); if (!s) return <RsEmpty mode="uxConversion" />
  return (
    <>
      <Card>
        <SectionTitle>Recommended actions</SectionTitle>
        <ActionsList actions={s.actions} />
      </Card>
      <Card>
        <SectionTitle>Experiments</SectionTitle>
        <Row label="Running" value={s.experiments.running} />
        <Row label="Wins 90d" value={s.experiments.wins90d} tone="good" />
        <Row label="Losses 90d" value={s.experiments.losses90d} tone={s.experiments.losses90d ? 'warn' : undefined} />
        <Row label="Cum lift" value={`${s.experiments.cumulativeLiftPct.toFixed(1)}%`} />
      </Card>
      <Card>
        <SectionTitle>Forecast</SectionTitle>
        {s.actions.filter(a => a.forecast).slice(0, 4).map(a =>
          <ForecastPill key={a.id} f={{ label: a.label, deltaValue: a.forecast!.deltaValue, unit: a.forecast!.unit, confidencePct: a.forecast!.confidencePct, positiveIsGood: a.forecast!.positiveIsGood }} />
        )}
      </Card>
    </>
  )
}
