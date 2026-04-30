import React from 'react'
import { Card, Histogram, Row, StackedBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { FullAuditStats } from '../../../../../services/right-sidebar/fullAudit'

export function FullIssuesTab({ stats }: RsTabProps<FullAuditStats>) {
  const seg = (sev: string) => stats.topIssueGroups.filter(i => i.severity === sev).reduce((s, x) => s + x.count, 0)
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="By severity">
        <StackedBar segments={[
          { label: 'P0', count: seg('blocking'),    tone: 'bad'  },
          { label: 'P1', count: seg('revenueLoss'), tone: 'bad'  },
          { label: 'P2', count: seg('highLeverage'), tone: 'warn' },
          { label: 'P3', count: seg('strategic'),   tone: 'neutral' },
          { label: 'P4', count: seg('hygiene'),     tone: 'good' },
        ]} />
      </Card>
      <Card title="Top issue groups">
        <Histogram bins={stats.topIssueGroups.map(i => ({ label: i.label, count: i.count, tone: i.severity === 'blocking' ? 'bad' : i.severity === 'highLeverage' ? 'warn' : undefined }))} />
      </Card>
      <Card title="Duplicates">
        <Row label="Duplicate titles"       value={stats.duplicates.titles}       tone={stats.duplicates.titles ? 'bad' : 'good'} />
        <Row label="Duplicate descriptions" value={stats.duplicates.descriptions} tone={stats.duplicates.descriptions ? 'bad' : 'good'} />
        <Row label="Duplicate H1s"          value={stats.duplicates.h1s}          tone={stats.duplicates.h1s ? 'bad' : 'good'} />
      </Card>
    </div>
  )
}
