import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Indexing() {
  const s = useRsStats('technical')
  if (!s) return <RsEmpty mode="technical" />
  const c = s.crawl
  return (
    <>
      <Card>
        <SectionTitle>robots.txt</SectionTitle>
        <Row label="Status" value={c.robotsOk ? 'OK' : 'fail'} tone={c.robotsOk ? 'good' : 'bad'} />
        <Row label="Disallowed paths" value={c.disallowedPaths} />
      </Card>
      <Card>
        <SectionTitle>Sitemaps</SectionTitle>
        {c.sitemaps.map(sm => <Row key={sm.url} label={sm.url} value={sm.valid ? 'valid' : 'invalid'} tone={sm.valid ? 'good' : 'bad'} />)}
      </Card>
      <Card>
        <SectionTitle>Discovery</SectionTitle>
        <Row label="Discovered" value={c.discovered} />
        <Row label="Crawled"    value={c.crawled} />
        <Row label="Skipped"    value={`blocked ${c.skipped.blocked} · oos ${c.skipped.outOfScope}`} />
      </Card>
      <Card>
        <SectionTitle>Depth</SectionTitle>
        <Histogram bins={c.depthHistogram} />
      </Card>
      <Card>
        <SectionTitle>Structural</SectionTitle>
        <Row label="Orphans"          value={c.structural.orphans}        tone={c.structural.orphans ? 'warn' : undefined} />
        <Row label="Redirect chains"  value={c.structural.redirectChains} tone={c.structural.redirectChains ? 'warn' : undefined} />
        <Row label="Canonical chains" value={c.structural.canonicalChains} tone={c.structural.canonicalChains ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Hreflang</SectionTitle>
        <Histogram bins={c.hreflang.langs.map(l => ({ label: l.lang, count: l.count }))} />
        <Row label="Reciprocal errors" value={c.hreflang.reciprocalErrors} tone={c.hreflang.reciprocalErrors ? 'warn' : undefined} />
      </Card>
      {c.crawlBudgetSignal != null && (
        <Card>
          <SectionTitle>Crawl budget</SectionTitle>
          <Row label="Signal" value={`${Math.round(c.crawlBudgetSignal * 100)}%`} tone={c.crawlBudgetSignal < 0.5 ? 'warn' : 'good'} />
        </Card>
      )}
    </>
  )
}
