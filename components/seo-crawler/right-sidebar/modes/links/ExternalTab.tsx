import React from 'react'
import { Card, Row, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LinksAuthorityStats } from '@/services/right-sidebar/linksAuthority'

export function LinksExternalTab({ stats }: RsTabProps<LinksAuthorityStats>) {
  const e = stats.external
  return (
    <Card title="Outbound links" right={<SourceChip source={ { tier: 'scrape', name: 'Crawler' } } />}>
      <Row label="Total outbound"   value={e.totalOutbound} />
      <Row label="Avg per page"     value={e.avgOutboundPerPage} />
      <Row label="Nofollow share"   value={`${e.nofollowPct}%`} />
      <Row label="Broken externals" value={e.brokenExternals} tone={e.brokenExternals === 0 ? 'good' : 'bad'} />
    </Card>
  )
}
