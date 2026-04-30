import React from 'react'
import { Card, StackedBar, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LinksAuthorityStats } from '../../../../../services/right-sidebar/linksAuthority'
import { pct } from '../../../../../services/right-sidebar/utils'

export function LinksAnchorsTab({ stats: { anchorMix: m } }: RsTabProps<LinksAuthorityStats>) {
  const total = Object.values(m).reduce((s, x) => s + x, 0) || 1
  const flag = m.exact / total > 0.2 ? 'bad' : m.exact / total > 0.1 ? 'warn' : 'good'
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Distribution">
        <StackedBar segments={[
          { label: 'Brand',   count: m.brand,   tone: 'good' },
          { label: 'Exact',   count: m.exact,   tone: flag },
          { label: 'Partial', count: m.partial, tone: 'good' },
          { label: 'Generic', count: m.generic, tone: 'neutral' },
          { label: 'URL',     count: m.url,     tone: 'neutral' },
          { label: 'Image',   count: m.image,   tone: 'neutral' },
        ]} />
      </Card>
      <Card title="Shares">
        <Row label="Brand %"   value={`${pct(m.brand, total)}%`} />
        <Row label="Exact %"   value={`${pct(m.exact, total)}%`} tone={flag === 'bad' ? 'bad' : flag === 'warn' ? 'warn' : 'good'} />
        <Row label="Generic %" value={`${pct(m.generic, total)}%`} />
      </Card>
    </div>
  )
}
