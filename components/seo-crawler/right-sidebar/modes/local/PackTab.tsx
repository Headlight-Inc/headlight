import React from 'react'
import { Card, KpiStrip, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LocalStats } from '../../../../../services/right-sidebar/local'

export function LocalPackTab({ stats: { pack: p } }: RsTabProps<LocalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Pack-3 visibility">
        <KpiStrip columns={2} tiles={[
          { label: 'Tracked',  value: p.keywordsTracked },
          { label: 'In pack-3', value: p.pack3Count },
          { label: 'Pack-3 %',  value: p.pack3Pct != null ? `${Math.round(p.pack3Pct * 100)}%` : '—',
            tone: (p.pack3Pct ?? 0) >= 0.5 ? 'good' : (p.pack3Pct ?? 0) >= 0.2 ? 'warn' : 'bad' },
        ]} />
      </Card>
      <Card title="Movers">
        {p.movers.length
          ? p.movers.slice(0, 8).map(m => <Row key={m.keyword} label={m.keyword} value={`${m.delta >= 0 ? '+' : ''}${m.delta}`} tone={m.delta >= 0 ? 'good' : 'bad'} />)
          : <div className="text-[11px] italic text-[#555]">No movement.</div>}
      </Card>
    </div>
  )
}
