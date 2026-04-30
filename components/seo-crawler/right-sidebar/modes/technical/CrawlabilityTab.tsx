import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Accessibility() {
  const s = useRsStats('technical')
  if (!s) return <RsEmpty mode="technical" />
  const a = s.accessibility
  return (
    <>
      <Card>
        <SectionTitle>WCAG</SectionTitle>
        <Histogram max={100} bins={[
          { label: 'A',   count: Math.round(a.wcagPct.A) },
          { label: 'AA',  count: Math.round(a.wcagPct.AA) },
          { label: 'AAA', count: Math.round(a.wcagPct.AAA) },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Top violations</SectionTitle>
        <Histogram bins={[
          { label: 'Contrast',  count: a.violations.contrast,    tone: 'warn' },
          { label: 'Alt miss',  count: a.violations.altMissing,  tone: 'warn' },
          { label: 'Label',     count: a.violations.labelMissing,tone: 'warn' },
          { label: 'Landmark',  count: a.violations.landmark,    tone: 'warn' },
          { label: 'aria',      count: a.violations.ariaInvalid, tone: 'warn' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Severity</SectionTitle>
        <Histogram bins={[
          { label: 'P0', count: a.severity.p0, tone: 'bad' },
          { label: 'P1', count: a.severity.p1, tone: 'bad' },
          { label: 'P2', count: a.severity.p2, tone: 'warn' },
          { label: 'P3', count: a.severity.p3, tone: 'warn' },
          { label: 'P4', count: a.severity.p4, tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Patterns</SectionTitle>
        <Row label="Keyboard nav" value={a.keyboardNavPass ? 'pass' : 'fail'} tone={a.keyboardNavPass ? 'good' : 'bad'} />
        <Row label="Focus visible" value={a.focusVisiblePass ? 'pass' : 'fail'} tone={a.focusVisiblePass ? 'good' : 'bad'} />
        <Row label="Skip-link"     value={a.skipLinkPresent ? 'yes' : 'no'} tone={a.skipLinkPresent ? 'good' : 'warn'} />
        <Row label="<html lang>"   value={a.langAttrPresent ? 'yes' : 'no'} tone={a.langAttrPresent ? 'good' : 'warn'} />
      </Card>
      <Card>
        <SectionTitle>Trend</SectionTitle>
        <Sparkline points={a.trend} width={140} height={28} />
      </Card>
    </>
  )
}
