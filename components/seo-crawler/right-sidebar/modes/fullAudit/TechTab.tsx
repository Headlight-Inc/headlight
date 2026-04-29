import React from 'react'
import { Card, Row, MiniBar, SourceChip, fmtTime } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit'

const SRC_CRAWL = { tier: 'scrape', name: 'Crawler' } as const

export function FullTechTab({ stats }: RsTabProps<FullAuditStats>) {
  const t = stats.tech
  return (
    <div className="flex flex-col gap-3">
      <Card title="Health" right={<SourceChip source={SRC_CRAWL} />}>
        <Row label="HTTPS"          value={`${t.httpsPct}%`}      tone={t.httpsPct >= 95 ? 'good' : 'bad'} />
        <Row label="Indexable"      value={`${t.indexablePct}%`} tone={t.indexablePct >= 80 ? 'good' : 'warn'} />
        <Row label="Broken pages"   value={t.brokenPages}        tone={t.brokenPages === 0 ? 'good' : 'bad'} />
        <Row label="Schema coverage" value={`${t.schemaCoveragePct}%`} tone={t.schemaCoveragePct >= 60 ? 'good' : 'warn'} />
        <Row label="Avg response"   value={fmtTime(t.avgResponseMs ?? null)} tone={(t.avgResponseMs ?? 0) < 800 ? 'good' : 'warn'} />
      </Card>
      <Card title="Score components" dense>
        <div className="flex flex-col gap-2">
          <div><div className="text-[10px] text-[#888] mb-1">HTTPS</div><MiniBar value={t.httpsPct} max={100} tone={t.httpsPct >= 95 ? 'good' : 'bad'} /></div>
          <div><div className="text-[10px] text-[#888] mb-1">Indexable</div><MiniBar value={t.indexablePct} max={100} tone={t.indexablePct >= 80 ? 'good' : 'warn'} /></div>
          <div><div className="text-[10px] text-[#888] mb-1">Schema</div><MiniBar value={t.schemaCoveragePct} max={100} tone={t.schemaCoveragePct >= 60 ? 'good' : 'warn'} /></div>
        </div>
      </Card>
    </div>
  )
}
