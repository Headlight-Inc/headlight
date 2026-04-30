import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Nap() {
  const s = useRsStats('local'); if (!s) return <RsEmpty mode="local" />
  const n = s.nap
  return (
    <>
      <Card>
        <SectionTitle>NAP grid</SectionTitle>
        <NapGrid rows={n.rows} />
      </Card>
      {n.inconsistencyExamples.length > 0 && (
        <Card>
          <SectionTitle>Examples</SectionTitle>
          {n.inconsistencyExamples.slice(0, 5).map((ex, i) => (
            <Row key={i} label={`${ex.source} · ${ex.field}`} value={`expected ${ex.expected} · found ${ex.found}`} tone="warn" />
          ))}
        </Card>
      )}
    </>
  )
}
