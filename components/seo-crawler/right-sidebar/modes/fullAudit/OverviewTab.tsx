// components/seo-crawler/right-sidebar/modes/fullAudit/OverviewTab.tsx
import React from 'react'
import {
  Card, Row, Gauge, StackedBar, Donut, Bar, StatTile,
  SourceChip, FreshnessChip, SectionTitle, Chip,
} from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit.types'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

const fmtInt = (n: number) => n.toLocaleString()
const delta = (n: number | null | undefined) =>
  n == null ? '' : (n > 0 ? `▲${n}` : n < 0 ? `▼${Math.abs(n)}` : '·')

export function FullOverviewTab({ stats }: RsTabProps<FullAuditStats>) {
  const o = stats.overview
  const segments = o.statusMix.map(s => ({ value: s.count, color: s.color, label: s.code }))

  return (
    <div className="flex flex-col gap-3">
      <Card title="Site score" right={<SourceChip source={SRC} />}>
        <div className="flex items-center gap-3">
          <Gauge value={o.score} label="score" />
          <div className="flex flex-col">
            <div className="text-[11px] text-neutral-500">vs last session</div>
            <div className={`text-[14px] font-semibold ${o.scoreDelta && o.scoreDelta > 0 ? 'text-emerald-400' : o.scoreDelta && o.scoreDelta < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
              {delta(o.scoreDelta) || '—'}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Headline">
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile label="Pages"     value={fmtInt(o.pages)} />
          <StatTile label="Indexable" value={`${o.indexablePct}%`} hint={delta(o.indexableDeltaPct)} />
          <StatTile label="Issues"    value={fmtInt(o.issues)}     hint={delta(o.issuesDelta)} tone={o.issues > 0 ? 'warn' : 'good'} />
          <StatTile label="New (ses)" value={o.pagesNewThisSession != null ? fmtInt(o.pagesNewThisSession) : '—'} />
        </div>
      </Card>

      <Card title="Status mix">
        <StackedBar segments={segments} height={10} />
        <div className="mt-2 grid grid-cols-2 gap-1">
          {o.statusMix.map(s => <Row key={s.code} label={s.code} value={fmtInt(s.count)} />)}
        </div>
      </Card>

      <Card title="Depth distribution">
        <Bar data={o.depthHistogram} />
      </Card>

      <Card title="Category mix">
        <div className="flex items-center gap-3">
          <Donut segments={o.categoryDonut.map(c => ({ label: c.label, value: c.value, color: c.color }))} />
          <div className="flex-1 grid grid-cols-1 gap-1">
            {o.categoryDonut.map(c => <Row key={c.label} label={c.label} value={fmtInt(c.value)} />)}
          </div>
        </div>
      </Card>

      <Card title="Crawl"
        right={<FreshnessChip at={o.crawl.lastFinishedAt ?? undefined} />}>
        {o.crawl.isRunning ? (
          <>
            <div className="text-[11px] text-neutral-400 mb-1">Crawling…</div>
            <div className="h-1.5 rounded bg-neutral-800 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${o.crawl.progressPct}%` }} />
            </div>
          </>
        ) : (
          <Row label="Last duration" value={o.crawl.durationMs ? `${(o.crawl.durationMs / 1000).toFixed(1)}s` : '—'} />
        )}
        <div className="mt-2 grid grid-cols-2 gap-1">
          <StatTile label="Errors"  value={fmtInt(o.crawl.errors)}  tone={o.crawl.errors  ? 'warn' : 'good'} />
          <StatTile label="Blocked" value={fmtInt(o.crawl.blocked)} tone={o.crawl.blocked ? 'warn' : 'good'} />
        </div>
      </Card>
    </div>
  )
}
