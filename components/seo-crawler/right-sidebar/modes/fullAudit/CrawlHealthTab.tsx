import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Crawl() {
  const s = useRsStats('fullAudit')
  if (!s) return <RsEmpty mode="fullAudit" />
  const c = s.crawl
  return (
    <>
      <Card>
        <SectionTitle>Last crawl</SectionTitle>
        <Row label="Pages crawled" value={c.pagesCrawled} />
        <Row label="Discovered" value={c.pagesDiscovered} />
        <Row label="Throughput" value={c.throughputPerSec ? `${c.throughputPerSec}/s` : '—'} />
        <Row label="Duration" value={c.durationMs ? `${(c.durationMs / 1000).toFixed(1)}s` : '—'} />
      </Card>
      <Card>
        <SectionTitle>Errors</SectionTitle>
        <Histogram bins={c.errorBreakdown} />
      </Card>
      <Card>
        <SectionTitle>Blocked</SectionTitle>
        <Histogram bins={c.blockedBreakdown} />
      </Card>
      <Card>
        <SectionTitle>Sitemap parity</SectionTitle>
        <StackedBar segments={[
          { label: 'In both', count: c.sitemapParity.inBoth, tone: 'good' },
          { label: 'Crawl only', count: c.sitemapParity.crawlOnly, tone: 'warn' },
          { label: 'Sitemap only', count: c.sitemapParity.sitemapOnly, tone: 'warn' },
        ]} />
      </Card>
    </>
  )
}
