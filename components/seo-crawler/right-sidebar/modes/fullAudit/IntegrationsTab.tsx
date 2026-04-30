import React from 'react'
import { Card, Row, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { FullAuditStats } from '../../../../../services/right-sidebar/fullAudit'

export function FullIntegrationsTab({ stats }: RsTabProps<FullAuditStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Connected sources">
        {stats.integrations.map(i => (
          <Row key={i.id}
               label={<span className="flex items-center gap-2">{i.label}{i.lastFetchedAt && <FreshnessChip at={i.lastFetchedAt} />}</span>}
               value={i.status === 'connected' ? '✓' : i.status === 'partial' ? 'partial' : '—'}
               tone={i.status === 'connected' ? 'good' : i.status === 'partial' ? 'warn' : 'bad'} />
        ))}
      </Card>
      <div className="text-[10px] text-[#666] px-1">Connect missing sources from Settings → Integrations.</div>
    </div>
  )
}
