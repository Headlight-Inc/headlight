import React from 'react'
import { Card, KpiStrip, Row, StackedBar, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LinksAuthorityStats } from '../../../../../services/right-sidebar/linksAuthority'

export function LinksOverviewTab({ stats: s }: RsTabProps<LinksAuthorityStats>) {
  if (s.source === 'none') return <RsPartial title="Connect Ahrefs, Semrush or Majestic" reason="Authority data needs an external link source." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Authority" right={<FreshnessChip at={s.fetchedAt} />}>
        <KpiStrip columns={2} tiles={[
          { label: 'Authority',     value: s.authorityScore },
          { label: 'Internal links', value: s.internal.totalLinks },
          { label: 'Ref domains',   value: s.external.domains },
          { label: 'Avg DR',        value: s.external.drAvg.toFixed(1) },
        ]} />
      </Card>
      <Card title="Internal map">
        <Row label="Avg per page" value={s.internal.avgPerPage.toFixed(1)} />
        <Row label="Orphans"      value={s.internal.orphans} tone={s.internal.orphans ? 'warn' : undefined} />
        <Row label="Deep pages"   value={s.internal.deepPages} tone={s.internal.deepPages ? 'warn' : undefined} />
      </Card>
      <Card title="Anchor mix">
        <StackedBar segments={[
          { label: 'Brand',   count: s.anchorMix.brand,   tone: 'good' },
          { label: 'Exact',   count: s.anchorMix.exact,   tone: 'warn' },
          { label: 'Partial', count: s.anchorMix.partial, tone: 'good' },
          { label: 'Generic', count: s.anchorMix.generic, tone: 'neutral' },
          { label: 'URL',     count: s.anchorMix.url,     tone: 'neutral' },
          { label: 'Image',   count: s.anchorMix.image,   tone: 'neutral' },
        ]} />
      </Card>
      <Card title="External momentum">
        <Row label="New (90d)"  value={s.external.new90d}  tone="good" />
        <Row label="Lost (90d)" value={s.external.lost90d} tone={s.external.lost90d > s.external.new90d ? 'warn' : undefined} />
        <Row label="Toxic"      value={s.toxic.domains}    tone={s.toxic.domains ? 'warn' : undefined} />
      </Card>
    </div>
  )
}
