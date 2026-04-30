import React from 'react'
import { Card, Row, MiniBar, StatTile, KpiTile } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

export function WqaActionsTab({ stats }: RsTabProps<WqaStats>) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <KpiTile label="High"   value={stats.actionPriorityCounts.high}   tone="bad" />
        <KpiTile label="Medium" value={stats.actionPriorityCounts.medium} tone="warn" />
        <KpiTile label="Low"    value={stats.actionPriorityCounts.low}    tone="neutral" />
      </div>

      <Card title="Priority split">
        <MiniBar
          data={[
            { label: 'High impact',   value: stats.actionPriorityCounts.high,   tone: 'bad' },
            { label: 'Medium impact', value: stats.actionPriorityCounts.medium, tone: 'warn' },
            { label: 'Low impact',    value: stats.actionPriorityCounts.low,    tone: 'good' },
          ]}
        />
      </Card>

      <Card title="Type distribution">
        <MiniBar
          data={[
            { label: 'Content',  value: stats.actionTypeCounts.content,   tone: 'info' },
            { label: 'Tech',     value: stats.actionTypeCounts.tech,      tone: 'info' },
            { label: 'Links',    value: stats.actionTypeCounts.links,     tone: 'info' },
            { label: 'Merge',    value: stats.actionTypeCounts.merge,     tone: 'info' },
            { label: 'Remove',   value: stats.actionTypeCounts.deprecate, tone: 'info' },
          ]}
        />
      </Card>

      <Card title="Owner load (Top 5)">
        {stats.ownerLoad.length > 0 ? (
          <div className="flex flex-col gap-2">
            {stats.ownerLoad.slice(0, 5).map(o => (
              <Row key={o.owner} label={o.owner} value={o.count} />
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-[#555] italic py-2">No assigned owners</div>
        )}
      </Card>

      {stats.forecast && (
        <Card title="Impact forecast">
          <StatTile 
            label="Est. click uplift" 
            value={`+${stats.forecast.clicksDelta.toLocaleString()}`} 
            sub={`Confidence: ${Math.round(stats.forecast.confidence * 100)}%`}
          />
          <div className="mt-2 text-[10px] text-[#666] leading-relaxed">
            Projected over next {stats.forecast.horizonDays} days if all High Priority actions are resolved.
          </div>
        </Card>
      )}
    </div>
  )
}
