import React from 'react'
import { Card, Row, BulletGauge } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { TechnicalStats } from '../../../../../services/right-sidebar/technical'
import { fmtTime } from '../../../../../services/right-sidebar/utils'

export function TechPerformanceTab({ stats: { performance: p } }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Core Web Vitals (p75)">
        <Row label="LCP" value={p.lcpP75 != null ? fmtTime(p.lcpP75) : '—'} tone={(p.lcpP75 ?? 0) <= 2500 ? 'good' : 'warn'} />
        <BulletGauge value={p.lcpP75 ?? 0} target={2500} max={Math.max(4000, (p.lcpP75 ?? 0) * 1.5)} />
        <Row label="INP" value={p.inpP75 != null ? fmtTime(p.inpP75) : '—'} tone={(p.inpP75 ?? 0) <= 200 ? 'good' : 'warn'} />
        <BulletGauge value={p.inpP75 ?? 0} target={200}  max={Math.max(500, (p.inpP75 ?? 0) * 1.5)} />
        <Row label="CLS" value={p.clsP75 != null ? p.clsP75.toFixed(2) : '—'} tone={(p.clsP75 ?? 0) <= 0.1 ? 'good' : 'warn'} />
      </Card>
      <Card title="TTFB">
        <Row label="p75" value={p.ttfbP75 != null ? fmtTime(p.ttfbP75) : '—'} />
      </Card>
      <Card title="Risk pages">
        <Row label="Slow (>2.5s)"     value={p.slowPages}            tone={p.slowPages           ? 'warn' : 'good'} />
        <Row label="Heavy (>2 MB)"    value={p.heavyPages}           tone={p.heavyPages          ? 'warn' : 'good'} />
        <Row label="Render-blocking"  value={p.renderBlockingPages}  tone={p.renderBlockingPages ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
