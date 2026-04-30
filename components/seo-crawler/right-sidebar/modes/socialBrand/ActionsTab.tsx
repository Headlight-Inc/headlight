import React from 'react'
import { Card, ActionsList } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { SocialBrandStats } from '../../../../../services/right-sidebar/socialBrand'

export function SocialActionsTab({ stats }: RsTabProps<SocialBrandStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title={`Actions (${stats.actions.length})`}><ActionsList actions={stats.actions} /></Card>
    </div>
  )
}
