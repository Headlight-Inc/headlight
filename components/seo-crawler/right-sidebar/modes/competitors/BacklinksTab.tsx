import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorStats } from '@/services/right-sidebar/competitors'

export function CompBacklinksTab({ stats }: RsTabProps<CompetitorStats>) {
  const b = stats.backlinks
  const SRC = { tier: 'authoritative', name: stats.source } as const
  return (
    <div className="flex flex-col gap-3">
      <Card title="Authority" right={<SourceChip source={SRC} />}>
        <Row label="Domain Rating (DR)" value={b.domainRating ?? '—'} tone={(b.domainRating ?? 0) >= 60 ? 'good' : 'warn'} />
        <ProgressBar value={b.domainRating ?? 0} max={100} tone={(b.domainRating ?? 0) >= 60 ? 'good' : 'warn'} />
        <Row label="Ref. Domains"       value={b.referringDomains?.toLocaleString() ?? '—'} />
        <Row label="Link gaps"          value={b.linkGapCount ?? '—'} tone={(b.linkGapCount ?? 0) > 0 ? 'bad' : 'good'} />
      </Card>
      {b.competitorDr.length > 0 && (
        <Card title="DR comparison">
          {b.competitorDr.map(c => <Row key={c.domain} label={c.domain} value={`DR ${c.dr}`} />)}
        </Card>
      )}
    </div>
  )
}
