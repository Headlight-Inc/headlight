import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Overview() {
  const s = useRsStats('paid'); if (!s) return <RsEmpty mode="paid" />
  if (s.source === 'none') return <RsPartial reason="No ads platform connected" />
  const o = s.overview
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Spend 30d', value: `$${o.spend30d.toLocaleString()}`, delta: o.deltas.spendPct != null ? { value: o.deltas.spendPct, positiveIsGood: false } : undefined },
        { label: 'Conv 30d',  value: o.conv30d,                        delta: o.deltas.convPct  != null ? { value: o.deltas.convPct  } : undefined },
        { label: 'CPA',       value: o.cpa  != null ? `$${o.cpa.toFixed(2)}`  : '—', delta: o.deltas.cpaPct  != null ? { value: o.deltas.cpaPct, positiveIsGood: false } : undefined },
        { label: 'ROAS',      value: o.roas != null ? o.roas.toFixed(2) : '—',     delta: o.deltas.roasPct != null ? { value: o.deltas.roasPct } : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>Pacing</SectionTitle>
        <Row label="Spent / Cap" value={`$${o.pacing.spent.toLocaleString()} / $${o.pacing.cap.toLocaleString()}`} tone={o.pacing.pct > 100 ? 'bad' : o.pacing.pct > 90 ? 'warn' : 'good'} />
        <Row label="Pace" value={`${Math.round(o.pacing.pct)}%`} />
      </Card>
      <Card>
        <SectionTitle>Quality / share</SectionTitle>
        <Row label="QS avg" value={o.qsAvg != null ? o.qsAvg.toFixed(1) : '—'} tone={o.qsAvg != null && o.qsAvg < 6 ? 'warn' : 'good'} />
        <Row label="Imp share" value={o.impressionSharePct != null ? `${Math.round(o.impressionSharePct)}%` : '—'} />
      </Card>
      {o.alerts.length > 0 && (
        <Card>
          <SectionTitle>Alerts</SectionTitle>
          {o.alerts.map((a, i) => <Row key={i} label={a.label} value={a.tone} tone={a.tone} />)}
        </Card>
      )}
    </>
  )
}
