import React, { useMemo, useState } from 'react'
import { Card, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

const SRC = { tier: 'scrape', name: 'Crawler' } as const
const BUCKETS = ['low', 'medium', 'high'] as const

export function WqaActionsTab({ stats }: RsTabProps<WqaStats>) {
  const [filter, setFilter] = useState<'all' | typeof BUCKETS[number]>('all')
  const list = useMemo(
    () => filter === 'all' ? stats.actions : stats.actions.filter(a => a.effort === filter),
    [stats.actions, filter],
  )
  return (
    <Card title={`Actions (${stats.actions.length})`} right={<SourceChip source={SRC} />}>
      <div className="flex gap-1 mb-2">
        {(['all', ...BUCKETS] as const).map(k => (
          <button key={k} onClick={() => setFilter(k)}
            className={`text-[10px] px-1.5 py-0.5 rounded border ${filter === k ? 'bg-[#161616] border-[#333] text-white' : 'border-[#1a1a1a] text-[#888]'}`}>
            {k}
          </button>
        ))}
      </div>
      <ActionsList actions={list} max={50} />
    </Card>
  )
}
