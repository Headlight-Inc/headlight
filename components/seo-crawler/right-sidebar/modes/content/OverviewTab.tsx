import React from 'react'
import { Card, KpiStrip, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { ContentStats } from '../../../../../services/right-sidebar/content'

export function ContentOverviewTab({ stats: s }: RsTabProps<ContentStats>) {
  const o = s.overview
  return (
    <div className="flex flex-col gap-3 p-3">
      <KpiStrip columns={2} tiles={[
        { label: 'Pages',     value: o.totalPages.toLocaleString() },
        { label: 'Thin',      value: `${o.thinPct}%`,     tone: o.thinPct < 10 ? 'good' : 'warn' },
        { label: 'Avg words', value: o.avgWords },
        { label: 'Fresh 30d', value: `${o.freshShare}%` },
      ]} />
      <Card title="Health">
        <Row label="Avg age (days)"          value={o.staleDays ?? '—'} />
        <Row label="Duplicate titles"        value={o.dupTitles} tone={o.dupTitles ? 'bad' : 'good'} />
        <Row label="Duplicate descriptions"  value={o.dupDescs}  tone={o.dupDescs  ? 'bad' : 'good'} />
      </Card>
    </div>
  )
}
