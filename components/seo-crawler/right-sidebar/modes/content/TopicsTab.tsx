import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Topics() {
  const s = useRsStats('content'); if (!s) return <RsEmpty mode="content" />
  const t = s.topics
  return (
    <>
      <KpiStrip tiles={[
        { label: 'Clusters',  value: t.clusters },
        { label: 'Hubs',      value: t.hubs },
        { label: 'Weak hubs', value: t.weakHubs, tone: t.weakHubs ? 'warn' : undefined },
        { label: 'Orphans',   value: t.orphanTopics, tone: t.orphanTopics ? 'warn' : undefined },
      ]} columns={2} />
      <Card>
        <SectionTitle>Top clusters</SectionTitle>
        <Histogram bins={t.topClusters.map(c => ({ label: c.label, count: Math.round(c.qAvg) }))} max={100} />
      </Card>
      <Card>
        <SectionTitle>Intent mix</SectionTitle>
        <StackedBar segments={t.intentMix.map(i => ({ label: i.label, count: i.pct }))} />
      </Card>
      <Card>
        <SectionTitle>Entity coverage</SectionTitle>
        <Row label="Primary"          value={t.entityCoverage.primary ?? '—'} />
        <Row label="Related entities" value={t.entityCoverage.related} />
        <Row label="Missing peers"    value={t.entityCoverage.missingPeer} tone={t.entityCoverage.missingPeer ? 'warn' : undefined} />
      </Card>
      <Card>
        <SectionTitle>Issues</SectionTitle>
        <Row label="Cannibalization"  value={t.cannibalization} tone={t.cannibalization ? 'warn' : undefined} />
        <Row label="Near-dupe groups" value={t.nearDupeGroups}  tone={t.nearDupeGroups ? 'warn' : undefined} />
        <Row label="Uncovered queries" value={t.uncoveredQueries} />
      </Card>
    </>
  )
}
