import React from 'react'
import { Card, Gauge, Chip, ActionsList, SourceChip, Donut } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { ContentStats } from '@/services/right-sidebar/content'

const SRC = { tier: 'scrape', name: 'Crawler' } as const
const INTENT_COLOR: Record<string, string> = {
  informational: '#60a5fa', commercial: '#fbbf24', transactional: '#4ade80', navigational: '#a78bfa', unknown: '#666',
}

export function ContentOverviewTab({ stats }: RsTabProps<ContentStats>) {
  return (
    <div className="flex flex-col gap-3">
      <Card title="Content health" right={<SourceChip source={SRC} />}>
        <div className="flex items-center gap-3">
          <Gauge value={stats.overall.score} label="score" />
          <div className="flex-1 flex flex-wrap gap-1">
            {stats.overall.chips.map(c => <Chip key={c.label} tone={c.tone}>{c.label}: {c.value}</Chip>)}
          </div>
        </div>
      </Card>
      <Card title="Intent mix">
        <Donut
          segments={stats.intentMix.map(i => ({ value: i.count, color: INTENT_COLOR[i.kind] ?? '#666', label: i.kind }))}
          label={`${stats.intentMix.reduce((s, i) => s + i.count, 0)} pages`}
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {stats.intentMix.map(i => (
            <Chip key={i.kind} tone="neutral">{i.kind}: {i.count}</Chip>
          ))}
        </div>
      </Card>
      <Card title="Top fixes"><ActionsList actions={stats.actions.slice(0, 5)} /></Card>
    </div>
  )
}
