import React from 'react'
import { Card, Row, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LinksAuthorityStats } from '../../../../../services/right-sidebar/linksAuthority'

export function LinksInternalTab({ stats: { internal: i } }: RsTabProps<LinksAuthorityStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Volume">
        <Row label="Total internal links" value={i.totalLinks} />
        <Row label="Avg per page"         value={i.avgPerPage.toFixed(1)} />
      </Card>
      <Card title="Risk pages">
        <Row label="Orphan pages"        value={i.orphans}          tone={i.orphans          ? 'warn' : 'good'} />
        <Row label="Deep (>5 hops)"      value={i.deepPages}        tone={i.deepPages        ? 'warn' : 'good'} />
        <Row label="Broken internal"     value={i.brokenInternal}   tone={i.brokenInternal   ? 'bad'  : 'good'} />
        <Row label="Nofollow internal"   value={i.nofollowInternal} tone={i.nofollowInternal ? 'warn' : 'good'} />
      </Card>
      <Card title="Internal-link health">
        <ProgressBar value={Math.max(0, 100 - 100 * (i.orphans + i.deepPages) / Math.max(1, i.totalLinks))} max={100} />
      </Card>
    </div>
  )
}
