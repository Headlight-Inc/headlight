import React from 'react'
import { Card, KpiStrip, StackedBar, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { PaidStats } from '../../../../../services/right-sidebar/paid'

export function PaidOverviewTab({ stats: s }: RsTabProps<PaidStats>) {
  if (s.source === 'none') return <RsPartial title="Connect Google Ads or Meta Ads" reason="Paid metrics need an ads integration." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="30-day" right={<FreshnessChip at={s.fetchedAt} />}>
        <KpiStrip columns={2} tiles={[
          { label: 'Spend',       value: s.overview.spend30d != null ? `$${s.overview.spend30d.toLocaleString()}` : '—' },
          { label: 'Conversions', value: s.overview.conversions30d ?? '—' },
          { label: 'ROAS',        value: s.overview.roas != null ? s.overview.roas.toFixed(2) : '—', tone: (s.overview.roas ?? 0) >= 3 ? 'good' : 'warn' },
          { label: 'CPA',         value: s.overview.cpa != null ? `$${s.overview.cpa.toFixed(0)}` : '—' },
        ]} />
      </Card>
      <Card title="Impression share">
        <KpiStrip columns={1} tiles={[
          { label: 'IS', value: s.overview.impressionShare != null ? `${Math.round(s.overview.impressionShare * 100)}%` : '—',
            tone: (s.overview.impressionShare ?? 0) >= 0.7 ? 'good' : (s.overview.impressionShare ?? 0) >= 0.5 ? 'warn' : 'bad' },
        ]} />
      </Card>
      <Card title="Devices">
        <StackedBar segments={[
          { label: 'Mobile',  count: s.overview.deviceMix.mobile,  tone: 'neutral' },
          { label: 'Desktop', count: s.overview.deviceMix.desktop, tone: 'neutral' },
          { label: 'Tablet',  count: s.overview.deviceMix.tablet,  tone: 'neutral' },
        ]} />
      </Card>
    </div>
  )
}
