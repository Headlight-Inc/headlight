import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Actions() {
  const s = useRsStats('paid'); if (!s) return <RsEmpty mode="paid" />
  return (
    <>
      <Card>
        <SectionTitle>Recommended actions</SectionTitle>
        <ActionsList actions={s.actions} />
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
