import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Content() {
  const s = useRsStats('wqa')
  if (!s) return <RsEmpty mode="wqa" />
  return (
    <>
      <Card>
        <SectionTitle>Words</SectionTitle>
        <Histogram bins={s.wordsHistogram} />
      </Card>
      <Card>
        <SectionTitle>Readability</SectionTitle>
        <Histogram bins={s.readabilityHistogram} />
      </Card>
      <Card>
        <SectionTitle>Freshness</SectionTitle>
        <Histogram bins={s.freshnessHistogram} />
      </Card>
      <Card>
        <SectionTitle>Duplication</SectionTitle>
        <Row label="Near-dupe groups" value={s.duplication.nearDupeGroups} tone={s.duplication.nearDupeGroups ? 'warn' : undefined} />
        <Row label="Cannibal pairs"   value={s.duplication.cannibalPairs}  tone={s.duplication.cannibalPairs ? 'warn' : undefined} />
        <Row label="Exact dupes"      value={s.duplication.exactDupes}     tone={s.duplication.exactDupes ? 'bad' : undefined} />
      </Card>
      <Card>
        <SectionTitle>E-E-A-T coverage</SectionTitle>
        <Histogram max={s.eeatCoverage.total} bins={[
          { label: 'Bylines',  count: s.eeatCoverage.bylines,      tone: 'good' },
          { label: 'Updated',  count: s.eeatCoverage.updatedDates, tone: 'good' },
          { label: 'Cites',    count: s.eeatCoverage.citations,    tone: 'good' },
          { label: 'Bios',     count: s.eeatCoverage.bios,         tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Schema coverage</SectionTitle>
        <Histogram max={s.schemaCoverage.total} bins={[
          { label: 'Article', count: s.schemaCoverage.article },
          { label: 'Product', count: s.schemaCoverage.product },
          { label: 'FAQ',     count: s.schemaCoverage.faq },
          { label: 'HowTo',   count: s.schemaCoverage.howto },
        ]} />
      </Card>
    </>
  )
}
