import React from 'react'
import { Card, Row, StackedBar, ProgressBar } from '../../shared'
import { fmtTime } from '../../../../../services/right-sidebar/utils'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { WqaStats } from '../../../../../services/right-sidebar/wqa'

export function WqaTechTab({ stats }: RsTabProps<WqaStats>) {
  const t = stats.tech
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Status mix"><StackedBar segments={t.statusMix} /></Card>
      <Card title="Indexability">
        <Row label="Indexable"          value={t.indexableCount}     tone="good" />
        <Row label="Noindex"            value={t.noindexCount}       tone={t.noindexCount === 0 ? 'good' : 'warn'} />
        <Row label="Blocked"            value={t.blockedCount}       tone={t.blockedCount === 0 ? 'good' : 'bad'} />
        <Row label="Canonical mismatch" value={t.canonMismatchCount} tone={t.canonMismatchCount === 0 ? 'good' : 'warn'} />
      </Card>
      <Card title="Core Web Vitals (p75)">
        <Row label="LCP" value={t.cwv.lcpP75 != null ? fmtTime(t.cwv.lcpP75) : '—'} tone={(t.cwv.lcpP75 ?? 0) <= 2500 ? 'good' : 'warn'} />
        <Row label="INP" value={t.cwv.inpP75 != null ? fmtTime(t.cwv.inpP75) : '—'} tone={(t.cwv.inpP75 ?? 0) <= 200  ? 'good' : 'warn'} />
        <Row label="CLS" value={t.cwv.clsP75 != null ? t.cwv.clsP75.toFixed(2) : '—'} tone={(t.cwv.clsP75 ?? 0) <= 0.1 ? 'good' : 'warn'} />
      </Card>
      <Card title="Health">
        <Row label="HTTPS" value={`${t.httpsPct}%`} tone={t.httpsPct >= 99 ? 'good' : 'bad'} />
        <ProgressBar value={t.httpsPct} max={100} />
        <Row label="Slow pages"  value={t.slowPages}  tone={t.slowPages  ? 'warn' : 'good'} />
        <Row label="Heavy pages" value={t.heavyPages} tone={t.heavyPages ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
