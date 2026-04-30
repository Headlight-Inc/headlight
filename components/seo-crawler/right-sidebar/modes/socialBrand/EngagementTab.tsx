import React from 'react'
import { Card, Row, BestTimeHeatmap } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { SocialBrandStats } from '../../../../../services/right-sidebar/socialBrand'

export function SocialEngagementTab({ stats: { engagement: e } }: RsTabProps<SocialBrandStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Engagement rate">
        <Row label="Avg ER" value={e.engagementRate != null ? `${(e.engagementRate * 100).toFixed(2)}%` : '—'} tone={(e.engagementRate ?? 0) >= 0.03 ? 'good' : 'warn'} />
      </Card>
      <Card title="Best time to post"><BestTimeHeatmap buckets={e.bestTimeBuckets} /></Card>
      <Card title="Top posts">
        {e.topPosts.length
          ? e.topPosts.slice(0, 6).map(p => <Row key={p.title} label={`${p.network} · ${p.title}`} value={`${p.reach.toLocaleString()} · ${(p.engagementRate * 100).toFixed(1)}%`} />)
          : <div className="text-[11px] italic text-[#555]">No post data.</div>}
      </Card>
    </div>
  )
}
