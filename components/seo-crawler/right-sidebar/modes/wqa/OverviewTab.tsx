import React from 'react'
import { Card, Row, StatTile, SourceChip, MiniBar, Sparkline } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

export function WqaOverviewTab({ stats }: RsTabProps<WqaStats>) {
  const SRC = { tier: 'scrape', name: 'WQA Intelligence' } as const
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Quality score" value={stats.overallScore} tone={stats.overallScore >= 70 ? 'good' : 'warn'} />
        <StatTile label="Actions" value={stats.actions.length} tone={stats.actions.length > 10 ? 'bad' : 'neutral'} />
      </div>

      <Card title="Quality distribution">
        <MiniBar
          data={[
            { label: '0–20',  value: stats.qualityHistogram[0] },
            { label: '20–40', value: stats.qualityHistogram[1] },
            { label: '40–60', value: stats.qualityHistogram[2] },
            { label: '60–80', value: stats.qualityHistogram[3] },
            { label: '80–100',value: stats.qualityHistogram[4] },
          ]}
        />
      </Card>

      <Card title="Page mix" right={<SourceChip source={SRC} />}>
        <MiniBar
          data={stats.categoryMix.map(c => ({
            label: c.name,
            value: c.count,
            tone: 'info' as const
          }))}
        />
      </Card>

      <Card title="Search performance">
        <Row label="Total impressions" value={stats.search.impr28d.toLocaleString()} />
        <div className="h-12 mt-1">
          <Sparkline data={stats.search.imprSeries} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-[10px] text-[#666] uppercase">Avg CTR</div>
            <div className="text-sm font-mono">{(stats.search.ctr28d * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#666] uppercase">Avg Position</div>
            <div className="text-sm font-mono">{stats.search.pos28d.toFixed(1)}</div>
          </div>
        </div>
      </Card>

      <Card title="Needs decision">
        <Row label="Rewrite" value={stats.needsDecision.rewrite} />
        <Row label="Merge"   value={stats.needsDecision.merge} />
        <Row label="Expand"  value={stats.needsDecision.expand} />
        <Row label="Remove"  value={stats.needsDecision.deprecate} />
      </Card>
    </div>
  )
}
