import React, { useMemo, useState } from 'react'
import { Card, ActionsList, Histogram, StackedBar, ForecastPill } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { WqaStats } from '../../../../../services/right-sidebar/wqa'

const BUCKETS = ['low', 'med', 'high'] as const
export function WqaActionsTab({ stats: s }: RsTabProps<WqaStats>) {
  const [filter, setFilter] = useState<'all' | typeof BUCKETS[number]>('all')
  const list = useMemo(() => filter === 'all' ? s.actions : s.actions.filter(a => a.effort === filter), [filter, s.actions])
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="By priority">
        <StackedBar segments={[
          { label: 'High',   count: s.actionsByPriority.high,   tone: 'bad'  },
          { label: 'Medium', count: s.actionsByPriority.medium, tone: 'warn' },
          { label: 'Low',    count: s.actionsByPriority.low,    tone: 'good' },
        ]} />
      </Card>
      <Card title={`Actions (${list.length})`} right={
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="text-[10px] bg-[#0f0f0f] border border-[#222] rounded px-1 py-0.5 text-[#aaa]">
          <option value="all">All</option><option value="low">Low effort</option><option value="med">Med</option><option value="high">High</option>
        </select>
      }>
        <ActionsList actions={list} />
      </Card>
      <Card title="Top templates">
        <Histogram bins={s.topActionTemplates.map(t => ({ label: t.label, count: t.pagesAffected }))} />
      </Card>
      {s.impactForecast && (
        <Card title="Forecast if all High shipped">
          <div className="flex flex-wrap gap-1">
            <ForecastPill f={s.impactForecast.traffic} />
            <ForecastPill f={s.impactForecast.conversions} />
          </div>
        </Card>
      )}
    </div>
  )
}
