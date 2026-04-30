import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Traffic() {
  const s = useRsStats('socialBrand'); if (!s) return <RsEmpty mode="socialBrand" />
  const t = s.traffic
  if (t.funnel.length === 0) return <RsPartial reason="Social traffic data not connected" />
  return (
    <>
      <Card>
        <SectionTitle>Funnel</SectionTitle>
        <FunnelBar steps={t.funnel} />
      </Card>
      <Card>
        <SectionTitle>Per platform</SectionTitle>
        {t.perPlatform.map(p => (
          <Row key={p.platform} label={p.platform} value={`${p.sess} sess · ${p.convPct.toFixed(1)}% · $${p.revenue.toLocaleString()}`} />
        ))}
      </Card>
      <Card>
        <SectionTitle>Top landings</SectionTitle>
        {t.topLandings.slice(0, 5).map(l => (
          <Row key={l.url} label={l.url} value={`${l.sess} sess · b ${Math.round(l.bouncePct)}%`} tone={l.bouncePct > 70 ? 'warn' : undefined} />
        ))}
      </Card>
      {t.messageMatch.length > 0 && (
        <Card>
          <SectionTitle>Message match</SectionTitle>
          {t.messageMatch.slice(0, 4).map((m, i) => <Row key={i} label={`post ↔ lp`} value={`${Math.round(m.score * 100)}%`} tone={m.score < 0.5 ? 'warn' : 'good'} />)}
        </Card>
      )}
    </>
  )
}
