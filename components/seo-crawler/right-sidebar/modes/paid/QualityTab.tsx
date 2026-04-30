import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Quality() {
  const s = useRsStats('paid'); if (!s) return <RsEmpty mode="paid" />
  const q = s.quality
  return (
    <>
      <Card>
        <SectionTitle>Quality Score</SectionTitle>
        <Row label="Average" value={q.qsAvg != null ? q.qsAvg.toFixed(1) : '—'} tone={q.qsAvg != null && q.qsAvg < 6 ? 'warn' : 'good'} />
        <Row label="Expected CTR" value={q.components.expectedCtr} />
        <Row label="Ad relevance" value={q.components.adRel} />
        <Row label="LP experience" value={q.components.lpExp} tone={q.components.lpExp === 'below' ? 'warn' : 'good'} />
      </Card>
      <Card>
        <SectionTitle>Ads by QS</SectionTitle>
        <Histogram bins={q.adsByQs.map(a => ({ label: `QS${a.qs}`, count: a.count, tone: a.tone }))} />
      </Card>
      {q.lpExpByPage.length > 0 && (
        <Card>
          <SectionTitle>LP issues</SectionTitle>
          {q.lpExpByPage.slice(0, 5).map(p => <Row key={p.url} label={p.url} value={p.tone} tone={p.tone === 'below' ? 'warn' : undefined} />)}
        </Card>
      )}
      <Card>
        <SectionTitle>Disapprovals</SectionTitle>
        <Row label="Total" value={q.disapprovals.count} tone={q.disapprovals.count ? 'warn' : undefined} />
        <Histogram bins={q.disapprovals.reasons.map(r => ({ label: r.reason, count: r.count, tone: 'warn' as const }))} />
      </Card>
    </>
  )
}
