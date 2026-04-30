import React from 'react'
import { Card, KpiStrip, Chip, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LocalStats } from '../../../../../services/right-sidebar/local'

export function LocalOverviewTab({ stats: s }: RsTabProps<LocalStats>) {
  if (s.source === 'none') return <RsPartial title="Connect Google Business Profile" reason="Local data needs GBP or BrightLocal." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Local pulse" right={<FreshnessChip at={s.fetchedAt} />}>
        <div className="flex items-center gap-2 mb-2">
          <Chip tone={s.overview.gbpVerified ? 'good' : 'bad'}>{s.overview.gbpVerified ? 'GBP verified' : 'unverified'}</Chip>
          {s.overview.topKeyword && <Chip>top kw: {s.overview.topKeyword}</Chip>}
        </div>
        <KpiStrip columns={2} tiles={[
          { label: 'Rating',     value: s.overview.rating != null ? s.overview.rating.toFixed(1) : '—' },
          { label: 'Reviews',    value: s.overview.reviews ?? '—' },
          { label: 'NAP consistency', value: `${s.overview.napConsistencyPct}%`, tone: s.overview.napConsistencyPct >= 95 ? 'good' : s.overview.napConsistencyPct >= 80 ? 'warn' : 'bad' },
          { label: 'Pack-3 share',     value: s.overview.pack3Pct != null ? `${Math.round(s.overview.pack3Pct * 100)}%` : '—' },
        ]} />
      </Card>
    </div>
  )
}
