import React from 'react'
import { Card, KpiStrip, Row, StackedBar, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { UxConversionStats } from '../../../../../services/right-sidebar/uxConversion'

export function UxOverviewTab({ stats: s, deps }: RsTabProps<UxConversionStats>) {
  const noGa4 = !deps.integrationConnections?.ga4
  return (
    <div className="flex flex-col gap-3 p-3">
      {noGa4 && <RsPartial title="Connect GA4 for site-wide CVR" reason="Funnels and conversions need analytics data." />}
      <KpiStrip columns={2} tiles={[
        { label: 'Site CVR',    value: s.overview.siteCvrPct != null ? `${s.overview.siteCvrPct}%` : '—', tone: (s.overview.siteCvrPct ?? 0) >= 2 ? 'good' : 'warn' },
        { label: 'Top goal',    value: s.overview.topGoal ? `${s.overview.topGoal.label} ${s.overview.topGoal.pct}%` : '—' },
        { label: 'Engage time', value: s.overview.engageTimeSec != null ? `${Math.round(s.overview.engageTimeSec)}s` : '—' },
        { label: 'CWV pass',    value: `${s.overview.cwvPassPct}%`, tone: s.overview.cwvPassPct >= 75 ? 'good' : 'warn' },
      ]} />
      <Card title="Devices">
        <StackedBar segments={[
          { label: 'Mobile',  count: s.overview.deviceMix.mobile,  tone: 'neutral' },
          { label: 'Desktop', count: s.overview.deviceMix.desktop, tone: 'neutral' },
          { label: 'Tablet',  count: s.overview.deviceMix.tablet,  tone: 'neutral' },
        ]} />
      </Card>
      <Card title="Friction signal">
        <Row label="Pages with rage clicks" value={s.overview.rageClicks} tone={s.overview.rageClicks ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
