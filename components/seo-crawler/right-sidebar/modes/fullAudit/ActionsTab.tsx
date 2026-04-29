import React from 'react'
import { Card, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function FullActionsTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <Card title="All quick fixes" right={<SourceChip source={SRC} />}>
      <ActionsList actions={stats.actions} max={20} />
    </Card>
  )
}
