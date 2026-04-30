import React from 'react'
import { Card, ActionsList } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { UxConversionStats } from '../../../../../services/right-sidebar/uxConversion'

export function UxActionsTab({ stats }: RsTabProps<UxConversionStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title={`Actions (${stats.actions.length})`}><ActionsList actions={stats.actions} /></Card>
    </div>
  )
}
