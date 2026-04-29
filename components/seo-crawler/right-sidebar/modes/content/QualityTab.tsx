import React from 'react'
import { Card, Row, MiniBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { ContentStats } from '@/services/right-sidebar/content'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function ContentQualityTab({ stats }: RsTabProps<ContentStats>) {
  const q = stats.quality
  return (
    <div className="flex flex-col gap-3">
      <Card title="Coverage" right={<SourceChip source={SRC} />}>
        <Row label="Titles"        value={`${q.titleCoveragePct}%`} />
        <MiniBar value={q.titleCoveragePct} max={100} tone={q.titleCoveragePct >= 95 ? 'good' : 'warn'} />
        <Row label="Descriptions"  value={`${q.descCoveragePct}%`} />
        <MiniBar value={q.descCoveragePct}  max={100} tone={q.descCoveragePct >= 90 ? 'good' : 'warn'} />
        <Row label="H1"            value={`${q.h1CoveragePct}%`} />
        <MiniBar value={q.h1CoveragePct}    max={100} tone={q.h1CoveragePct >= 95 ? 'good' : 'warn'} />
      </Card>
      <Card title="Quality">
        <Row label="Avg words"       value={q.avgWords}    tone={q.avgWords >= 600 ? 'good' : q.avgWords >= 300 ? 'warn' : 'bad'} />
        <Row label="Thin pages"      value={`${q.thinPct}%`} tone={q.thinPct < 10 ? 'good' : 'warn'} />
        <Row label="Readability (median)" value={q.medianReadabilityScore?.toFixed(0) ?? '—'} />
        <Row label="Avg age (days)"  value={q.avgFreshnessDays ?? '—'} />
        <Row label="Stale (>1 yr)"   value={q.stalePages} tone={q.stalePages === 0 ? 'good' : 'warn'} />
        <Row label="Duplicate titles"        value={q.dupTitles}      tone={q.dupTitles === 0 ? 'good' : 'bad'} />
        <Row label="Duplicate descriptions"  value={q.dupDescriptions} tone={q.dupDescriptions === 0 ? 'good' : 'bad'} />
      </Card>
    </div>
  )
}
