import React from 'react'
import { Card, Row, BulletGauge, SourceChip, fmtTime } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function TechPerformanceTab({ stats }: RsTabProps<TechnicalStats>) {
  const p = stats.performance
  return (
    <div className="flex flex-col gap-3">
      <Card title="Core Web Vitals (p75)" right={<SourceChip source={SRC} />}>
        <Row label="LCP" value={fmtTime(p.p75LcpMs)} tone={p.p75LcpMs <= 2500 ? 'good' : p.p75LcpMs <= 4000 ? 'warn' : 'bad'} />
        <BulletGauge value={p.p75LcpMs} target={2500} max={Math.max(4000, p.p95LcpMs)} />
        {p.p75InpMs != null && <>
          <Row label="INP" value={fmtTime(p.p75InpMs)} tone={p.p75InpMs <= 200 ? 'good' : p.p75InpMs <= 500 ? 'warn' : 'bad'} />
          <BulletGauge value={p.p75InpMs} target={200} max={Math.max(500, p.p75InpMs * 2)} />
        </>}
        {p.p75ClsScore != null && <Row label="CLS" value={p.p75ClsScore.toFixed(2)} tone={p.p75ClsScore <= 0.1 ? 'good' : p.p75ClsScore <= 0.25 ? 'warn' : 'bad'} />}
        {p.p75TtfbMs != null && <Row label="TTFB" value={fmtTime(p.p75TtfbMs)} />}
      </Card>
      <Card title="Distribution">
        <Row label="LCP p50 / p95" value={`${fmtTime(p.p50LcpMs)} / ${fmtTime(p.p95LcpMs)}`} />
        <Row label="Slow pages (>2.5s)" value={p.slowPages} tone={p.slowPages === 0 ? 'good' : 'warn'} />
        <Row label="Heavy pages (>2 MB)" value={p.heavyPages} tone={p.heavyPages === 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
