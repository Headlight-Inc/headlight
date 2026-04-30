import React from 'react'
import { Card, ActionsList } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { PaidStats } from '../../../../../services/right-sidebar/paid'

export function PaidActionsTab({ stats }: RsTabProps<PaidStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title={`Actions (${stats.actions.length})`}><ActionsList actions={stats.actions} /></Card>
    </div>
  )
}
