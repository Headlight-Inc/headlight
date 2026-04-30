import React from 'react'
import { Card, KpiStrip, Histogram, StackedBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { WqaStats } from '../../../../../services/right-sidebar/wqa'

export function WqaOverviewTab({ stats: s }: RsTabProps<WqaStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <KpiStrip columns={2} tiles={[
        { label: 'Q-score',  value: s.qScore, delta: s.qScoreDeltaPct != null ? { value: s.qScoreDeltaPct } : undefined, spark: s.qScoreSpark },
        { label: 'Pages',    value: s.pages },
        { label: 'Clicks/d', value: s.search.clicks ?? '—',  delta: s.search.clicksDeltaPct != null ? { value: s.search.clicksDeltaPct } : undefined },
        { label: 'Issues',   value: s.issuesTotal,           delta: s.issuesDeltaPct != null ? { value: s.issuesDeltaPct, positiveIsGood: false } : undefined },
      ]} />
      <Card title="Quality distribution"><Histogram bins={s.qualityHistogram.map(b => ({ label: b.label, count: b.count }))} /></Card>
      <Card title="Needs decision">
        <StackedBar segments={[
          { label: 'Rewrite',   count: s.needsDecision.rewrite,   tone: 'warn' },
          { label: 'Merge',     count: s.needsDecision.merge,     tone: 'warn' },
          { label: 'Expand',    count: s.needsDecision.expand,    tone: 'neutral' },
          { label: 'Deprecate', count: s.needsDecision.deprecate, tone: 'bad' },
        ]} />
      </Card>
    </div>
  )
}
