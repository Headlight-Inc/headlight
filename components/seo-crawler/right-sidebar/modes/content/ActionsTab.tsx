import React from 'react'
import { Card, ActionsList } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { ContentStats } from '../../../../../services/right-sidebar/content'

export function ContentActionsTab({ stats }: RsTabProps<ContentStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title={`Actions (${stats.actions.length})`}><ActionsList actions={stats.actions} /></Card>
    </div>
  )
}
