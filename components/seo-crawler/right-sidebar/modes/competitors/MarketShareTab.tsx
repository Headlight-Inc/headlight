import React from 'react'
import { Card, Row, Sparkline, Bar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorStats } from '@/services/right-sidebar/competitors'

export function CompMarketShareTab({ stats }: RsTabProps<CompetitorStats>) {
  const m = stats.marketShare
  const SRC = { tier: 'authoritative', name: stats.source } as const
  return (
    <div className="flex flex-col gap-3">
      <Card title="Visibility" right={<SourceChip source={SRC} />}>
        <Row label="Visibility %"  value={m.visibilityPct != null ? `${m.visibilityPct.toFixed(1)}%` : '—'} />
        <Row label="Avg position" value={m.avgPosition?.toFixed(1) ?? '—'} />
        {m.marketTrend.length > 1 && <div className="mt-2"><Sparkline data={m.marketTrend} width={220} height={40} /></div>}
      </Card>
      {m.keywordOverlap.length > 0 && (
        <Card title="Keyword overlap">
          <Bar data={m.keywordOverlap.slice(0, 6).map(x => ({ label: x.domain.slice(0, 10), value: x.count }))} />
        </Card>
      )}
    </div>
  )
}
