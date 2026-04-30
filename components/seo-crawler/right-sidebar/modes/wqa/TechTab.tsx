import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Tech() {
  const s = useRsStats('wqa')
  if (!s) return <RsEmpty mode="wqa" />
  return (
    <>
      <Card>
        <SectionTitle>Indexability</SectionTitle>
        <StackedBar segments={[
          { label: 'Indexable',     count: s.indexabilityMix.indexable,     tone: 'good' },
          { label: 'noindex',       count: s.indexabilityMix.noindex,       tone: 'warn' },
          { label: 'Blocked',       count: s.indexabilityMix.blocked,       tone: 'bad' },
          { label: 'Canonical diff',count: s.indexabilityMix.canonicalDiff, tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Status</SectionTitle>
        <StackedBar segments={s.statusMix} />
      </Card>
      <Card>
        <SectionTitle>Render mix</SectionTitle>
        <StackedBar segments={[
          { label: 'Static', count: s.renderMix.static, tone: 'good' },
          { label: 'SSR',    count: s.renderMix.ssr,    tone: 'good' },
          { label: 'CSR',    count: s.renderMix.csr,    tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Response times</SectionTitle>
        <Row label="p50" value={s.responseTimes.p50 != null ? `${s.responseTimes.p50}ms` : '—'} />
        <Row label="p90" value={s.responseTimes.p90 != null ? `${s.responseTimes.p90}ms` : '—'} />
        <Row label="p99" value={s.responseTimes.p99 != null ? `${s.responseTimes.p99}ms` : '—'} />
      </Card>
      <Card>
        <SectionTitle>Structural</SectionTitle>
        <Row label="Orphans"        value={s.structural.orphans}        tone={s.structural.orphans ? 'warn' : undefined} />
        <Row label="Deep pages"     value={s.structural.deep}           tone={s.structural.deep ? 'warn' : undefined} />
        <Row label="Redirect chains"value={s.structural.redirectChains} tone={s.structural.redirectChains ? 'warn' : undefined} />
        <Row label="Mixed content"  value={s.structural.mixedContent}   tone={s.structural.mixedContent ? 'bad' : undefined} />
      </Card>
    </>
  )
}
