import React from 'react'
import { Card, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

export function PaidActionsTab({ stats }: RsTabProps<PaidStats>) {
  const SRC = { tier: stats.source === 'none' ? 'scrape' : 'authoritative', name: stats.source === 'none' ? 'Crawler' : stats.source } as const
  return (
    <Card title={`Actions (${stats.actions.length})`} right={<SourceChip source={SRC} />}>
      <ActionsList actions={stats.actions} max={50} />
    </Card>
  )
}
