import React from 'react'
import { Card, KpiStrip, Sparkline, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { SocialBrandStats } from '../../../../../services/right-sidebar/socialBrand'

export function SocialOverviewTab({ stats: s }: RsTabProps<SocialBrandStats>) {
  if (s.source === 'none') return <RsPartial title="Connect a social listening tool" reason="Mention and sentiment data needs an integration." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Brand pulse" right={<FreshnessChip at={s.fetchedAt} />}>
        <KpiStrip columns={2} tiles={[
          { label: 'Followers',  value: s.overview.followersTotal.toLocaleString() },
          { label: 'Mentions 7d', value: s.overview.mentions7d, spark: s.overview.trend7d },
          { label: 'Sentiment',  value: s.overview.sentimentScore != null ? s.overview.sentimentScore.toFixed(2) : '—',
            tone: (s.overview.sentimentScore ?? 0) >= 0.3 ? 'good' : (s.overview.sentimentScore ?? 0) >= 0 ? 'warn' : 'bad' },
          { label: 'SoV',         value: s.overview.shareOfVoice != null ? `${Math.round(s.overview.shareOfVoice * 100)}%` : '—' },
        ]} />
      </Card>
      <Card title="Trend">
        {s.overview.trend7d.length > 1 ? <Sparkline points={s.overview.trend7d} width={280} height={36} /> : <div className="text-[11px] italic text-[#555]">No trend data.</div>}
      </Card>
    </div>
  )
}
