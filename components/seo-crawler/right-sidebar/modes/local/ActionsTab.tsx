import React from 'react'
import { Card, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

export function LocalActionsTab({ stats }: RsTabProps<LocalStats>) {
  return (
    <Card title={`Actions (${stats.actions.length})`} right={<SourceChip source={{ tier: 'scrape', name: 'Local Scan' }} />}>
      <ActionsList actions={stats.actions} max={50} />
    </Card>
  )
}
