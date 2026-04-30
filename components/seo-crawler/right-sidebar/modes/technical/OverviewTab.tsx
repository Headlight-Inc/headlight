import React from 'react'
import { Card, Gauge, Chip, KpiStrip, StackedBar, Histogram, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { TechnicalStats } from '../../../../../services/right-sidebar/technical'

export function TechOverviewTab({ stats: s }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Tech health" right={<FreshnessChip at={s.fetchedAt} />}>
        <div className="flex items-center gap-3">
          <Gauge value={s.overall.score} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">{s.overall.chips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}</div>
        </div>
      </Card>
      <Card title="Status mix"><StackedBar segments={s.overall.statusMix} /></Card>
      <Card title="Render mix">
        <StackedBar segments={[
          { label: 'Static', count: s.overall.renderMix.static, tone: 'good' },
          { label: 'SSR',    count: s.overall.renderMix.ssr,    tone: 'good' },
          { label: 'CSR',    count: s.overall.renderMix.csr,    tone: 'warn' },
        ]} />
      </Card>
      <Card title="TTFB"><KpiStrip columns={2} tiles={[
        { label: 'p75', value: s.overall.ttfb.p75 != null ? `${s.overall.ttfb.p75}ms` : '—' },
        { label: 'p90', value: s.overall.ttfb.p90 != null ? `${s.overall.ttfb.p90}ms` : '—' },
      ]} /></Card>
      <Card title="Top risks"><Histogram bins={s.overall.topRisks.map(r => ({ label: r.label, count: r.count, tone: 'warn' as const }))} /></Card>
    </div>
  )
}
