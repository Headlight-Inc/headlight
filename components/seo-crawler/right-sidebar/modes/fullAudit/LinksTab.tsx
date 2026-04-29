import React from 'react'
import { Card, Row, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function FullLinksTab({ stats }: RsTabProps<FullAuditStats>) {
  const l = stats.links
  return (
    <Card title="Link graph" right={<SourceChip source={SRC} />}>
      <Row label="Avg internal/page" value={l.avgInternalLinks} />
      <Row label="Avg external/page" value={l.avgExternalLinks} />
      <Row label="Orphan pages"      value={l.orphanPages}      tone={l.orphanPages === 0 ? 'good' : 'warn'} />
      <Row label="Redirect chains"   value={l.redirectChains}   tone={l.redirectChains === 0 ? 'good' : 'warn'} />
      <Row label="Broken links"      value={l.brokenLinks}      tone={l.brokenLinks === 0 ? 'good' : 'bad'} />
    </Card>
  )
}
