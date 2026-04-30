// components/seo-crawler/right-sidebar/modes/fullAudit/IssuesTab.tsx
import React from 'react'
import {
  Card, Row, Bar, StatTile, Sparkline, Chip,
  SourceChip, SectionTitle,
} from '@/components/seo-crawler/right-sidebar/shared'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit.types'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

const SEV_TONE = {
  critical: 'bad',  high: 'bad',
  medium:   'warn', low: 'info',
} as const

const SEV_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' } as const

export function FullIssuesTab({ stats }: RsTabProps<FullAuditStats>) {
  const { setAuditFilter, auditFilter } = useSeoCrawler()
  const i = stats.issues

  return (
    <div className="flex flex-col gap-3">
      <Card title="Severity split" right={<SourceChip source={SRC} />}>
        {i.severity.map(s => (
          <Row key={s.tone}
            label={
              <span className="flex items-center gap-1.5">
                <Chip tone={SEV_TONE[s.tone]}>{SEV_LABEL[s.tone]}</Chip>
              </span>
            }
            value={s.count.toLocaleString()}
            onClick={() => setAuditFilter({ ...auditFilter, severity: [s.tone] })}
          />
        ))}
      </Card>

      <Card title="By category">
        <Bar data={i.byCategory.map(c => ({ label: c.label, value: c.count }))} />
      </Card>

      <Card title="Top issues">
        {i.top.length === 0 ? (
          <div className="text-[11px] italic text-neutral-500">No issues detected.</div>
        ) : i.top.map(row => (
          <Row key={row.id}
            label={
              <span className="flex items-center gap-1.5">
                <Chip tone={SEV_TONE[row.severity]}>{row.severity[0].toUpperCase()}</Chip>
                <span className="truncate">{row.label}</span>
              </span>
            }
            value={row.count.toLocaleString()}
            onClick={() => setAuditFilter({ ...auditFilter, issueId: row.id })}
          />
        ))}
      </Card>

      <Card title="Trend (6 sessions)">
        <SectionTitle>All severities</SectionTitle>
        <Sparkline data={i.trendAll} width={240} height={28} />
        <div className="mt-2"><SectionTitle>Critical only</SectionTitle></div>
        <Sparkline data={i.trendCritical} width={240} height={28} />
      </Card>

      <Card title="This session">
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile label="New"      value={i.newThisSession.toLocaleString()}      tone={i.newThisSession      ? 'warn' : 'good'} />
          <StatTile label="Resolved" value={i.resolvedThisSession.toLocaleString()} tone="good" />
        </div>
      </Card>
    </div>
  )
}
