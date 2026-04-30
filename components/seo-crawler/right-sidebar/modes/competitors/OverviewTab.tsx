import React from 'react'
import { Card, KpiStrip, Row, RsPartial, FreshnessChip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CompetitorsStats } from '../../../../../services/right-sidebar/competitors'

export function CompOverviewTab({ stats: s }: RsTabProps<CompetitorsStats>) {
  if (s.source === 'none') return <RsPartial title="Connect Ahrefs or Semrush" reason="Competitor data needs an external research source." />
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Tracked competitors" right={<FreshnessChip at={s.fetchedAt} />}>
        <KpiStrip columns={2} tiles={[
          { label: 'Tracked',     value: s.overview.tracked },
          { label: 'Share of voice', value: s.overview.sov != null ? `${Math.round(s.overview.sov * 100)}%` : '—' },
          { label: 'Rank wins',   value: s.overview.rankWins,   tone: 'good' },
          { label: 'Rank losses', value: s.overview.rankLosses, tone: s.overview.rankLosses ? 'bad' : 'good' },
        ]} />
      </Card>
      <Card title="Top competitors">
        {s.competitors.length
          ? s.competitors.slice(0, 6).map(c => <Row key={c.domain} label={c.domain} value={`vis ${Math.round(c.visibility * 100)}% · ${c.deltaPct >= 0 ? '+' : ''}${(c.deltaPct * 100).toFixed(1)}%`} tone={c.deltaPct >= 0 ? 'good' : 'bad'} />)
          : <div className="text-[11px] italic text-[#555]">No competitors configured.</div>}
      </Card>
    </div>
  )
}
