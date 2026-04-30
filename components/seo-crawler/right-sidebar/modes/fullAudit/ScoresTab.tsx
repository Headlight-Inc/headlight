// components/seo-crawler/right-sidebar/modes/fullAudit/ScoresTab.tsx
import React from 'react'
import {
  Card, Row, Bar, StatTile, Gauge,
  SourceChip, SectionTitle,
} from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit.types'

const SRC = { tier: 'est', name: 'Heuristic' } as const

const tone = (v: number) => v >= 80 ? 'good' : v >= 60 ? 'warn' : 'bad'
const delta = (n: number | null) => n == null ? '' : n > 0 ? `▲${n}` : n < 0 ? `▼${Math.abs(n)}` : '·'

export function FullScoresTab({ stats }: RsTabProps<FullAuditStats>) {
  const s = stats.scores

  return (
    <div className="flex flex-col gap-3">
      <Card title="Overall" right={<SourceChip source={SRC} />}>
        <div className="flex items-center gap-3">
          <Gauge value={s.overall} label="score" />
          <div className="text-[12px] text-neutral-400">{delta(s.overallDelta) || 'no prior session'}</div>
        </div>
      </Card>

      <Card title="Subscores">
        {s.subscores.map(row => (
          <div key={row.axis} className="mb-2 last:mb-0">
            <Row label={row.axis} value={`${row.value}`} tone={tone(row.value)} />
            <div className="h-1.5 rounded bg-neutral-800 overflow-hidden">
              <div className="h-full"
                style={{
                  width: `${row.value}%`,
                  background: row.value >= 80 ? '#34d399' : row.value >= 60 ? '#fbbf24' : '#fb7185',
                }}
              />
            </div>
          </div>
        ))}
      </Card>

      {s.cohort && (
        <Card title="Percentile in cohort">
          <div className="text-[11px] text-neutral-400 mb-1">{s.cohort.label}</div>
          <div className="relative h-2 rounded bg-neutral-800">
            <div
              className="absolute -top-1 h-4 w-1 bg-emerald-400"
              style={{ left: `${Math.min(100, Math.max(0, s.cohort.percentile))}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
            <span>p0</span><span>p{s.cohort.percentile}</span><span>p100</span>
          </div>
        </Card>
      )}

      <Card title="Page-score distribution">
        <Bar data={s.pageDistribution} />
      </Card>

      <Card title="Movers (vs last session)">
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile label="Up"   value={s.movers.up.toLocaleString()}   tone={s.movers.up   ? 'good' : 'info'} />
          <StatTile label="Down" value={s.movers.down.toLocaleString()} tone={s.movers.down ? 'warn' : 'info'} />
        </div>
      </Card>
    </div>
  )
}
