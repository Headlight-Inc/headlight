import React from 'react'
import { Card, ActionsList, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { UxConversionStats } from '@/services/right-sidebar/uxConversion'

export function UxActionsTab({ stats }: RsTabProps<UxConversionStats>) {
  return (
    <Card title={`Actions (${stats.actions.length})`} right={<SourceChip source={{ tier: 'scrape', name: 'Crawler' }} />}>
      <ActionsList actions={stats.actions} max={50} />
    </Card>
  )
}
