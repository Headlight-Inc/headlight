import React from 'react'
import { Card, Row, StackedBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function FullContentTab({ stats }: RsTabProps<FullAuditStats>) {
  const c = stats.content
  const seg = (pctOk: number) => [
    { value: pctOk,         color: '#4ade80' },
    { value: 100 - pctOk,   color: '#1a1a1a' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <Card title="Coverage" right={<SourceChip source={SRC} />}>
        <Row label="Titles"        value={`${c.titleCoveragePct}%`} />
        <StackedBar segments={seg(c.titleCoveragePct)} />
        <Row label="Descriptions"  value={`${c.descCoveragePct}%`} />
        <StackedBar segments={seg(c.descCoveragePct)} />
        <Row label="H1"            value={`${c.h1CoveragePct}%`} />
        <StackedBar segments={seg(c.h1CoveragePct)} />
      </Card>
      <Card title="Quality">
        <Row label="Thin pages (<300 words)" value={`${c.thinPct}%`} tone={c.thinPct < 10 ? 'good' : 'warn'} />
        <Row label="Avg words/page"           value={c.avgWords}     tone={c.avgWords >= 600 ? 'good' : c.avgWords >= 300 ? 'warn' : 'bad'} />
        <Row label="Duplicate titles"         value={c.dupTitles}    tone={c.dupTitles === 0 ? 'good' : 'bad'} />
        <Row label="Duplicate descriptions"   value={c.dupDescriptions} tone={c.dupDescriptions === 0 ? 'good' : 'bad'} />
      </Card>
    </div>
  )
}
