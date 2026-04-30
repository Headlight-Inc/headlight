import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { CompetitorsStats } from '../../../../../services/right-sidebar/competitors'

export function CompSharedGapsTab({ stats: { sharedGaps: g } }: RsTabProps<CompetitorsStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Content gaps"><Row label="Pages competitors have, we don't" value={g.contentGaps} /></Card>
      <Card title="Keyword gaps">
        {g.keywords.length
          ? g.keywords.slice(0, 8).map(k => <Row key={k.keyword} label={`${k.keyword} · vol ${k.volume.toLocaleString()}`} value={`comps ${k.competitorsRanking} · us #${k.ourPosition ?? '—'}`} />)
          : <div className="text-[11px] italic text-[#555]">No keyword gaps.</div>}
      </Card>
    </div>
  )
}
