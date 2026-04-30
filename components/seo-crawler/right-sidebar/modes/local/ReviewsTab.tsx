import React from 'react'
import { Card, Row, Histogram, Chip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LocalStats } from '../../../../../services/right-sidebar/local'

export function LocalReviewsTab({ stats: { reviews: r } }: RsTabProps<LocalStats>) {
  const histogram = [1, 2, 3, 4, 5].map(s => ({ label: `${s}★`, count: r.recent30.filter(x => Math.round(x.rating) === s).length }))
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Snapshot">
        <Row label="Rating"        value={r.rating != null ? r.rating.toFixed(1) : '—'} />
        <Row label="Total reviews" value={r.count ?? '—'} />
        <Row label="Response rate" value={r.responseRate != null ? `${Math.round(r.responseRate * 100)}%` : '—'} tone={(r.responseRate ?? 0) >= 0.8 ? 'good' : 'warn'} />
      </Card>
      <Card title="Last 30 days">
        {r.recent30.length
          ? <Histogram bins={histogram} />
          : <div className="text-[11px] italic text-[#555]">No recent reviews.</div>}
      </Card>
      <Card title="Themes">
        {r.topKeywords.length
          ? <div className="flex flex-wrap gap-1">{r.topKeywords.slice(0, 8).map(k => <Chip key={k}>{k}</Chip>)}</div>
          : <div className="text-[11px] italic text-[#555]">No keyword themes.</div>}
      </Card>
    </div>
  )
}
