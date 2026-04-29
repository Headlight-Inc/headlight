import React from 'react'
import { Card, Row, BulletGauge, MiniBar, SourceChip, fmtTime } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { UxConversionStats } from '@/services/right-sidebar/uxConversion'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function UxPerformanceTab({ stats }: RsTabProps<UxConversionStats>) {
  const p = stats.performance
  return (
    <div className="flex flex-col gap-3">
      <Card title="Core Web Vitals" right={<SourceChip source={SRC} />}>
        <Row label="LCP p75" value={fmtTime(p.p75LcpMs)} tone={p.p75LcpMs <= 2500 ? 'good' : 'warn'} />
        <BulletGauge value={p.p75LcpMs} target={2500} max={Math.max(4000, p.p75LcpMs * 1.5)} />
        {p.p75InpMs != null && <Row label="INP p75" value={fmtTime(p.p75InpMs)} tone={p.p75InpMs <= 200 ? 'good' : 'warn'} />}
        {p.p75ClsScore != null && <Row label="CLS p75" value={p.p75ClsScore.toFixed(2)} tone={p.p75ClsScore <= 0.1 ? 'good' : 'warn'} />}
      </Card>
      <Card title="Pass rate">
        <Row label="Pages passing all CWV" value={`${p.cwvPassPct}%`} tone={p.cwvPassPct >= 75 ? 'good' : 'warn'} />
        <MiniBar value={p.cwvPassPct} max={100} tone={p.cwvPassPct >= 75 ? 'good' : 'warn'} />
        <Row label="Slow pages"  value={p.slowPages}  tone={p.slowPages === 0 ? 'good' : 'warn'} />
        <Row label="Heavy pages" value={p.heavyPages} tone={p.heavyPages === 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
