import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, StatTile, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Quadrant, Sparkline, StackedBar, MiniBar, Donut } from '../../shared/charts'

export function Quality() {
  const s = useRsStats('content'); if (!s) return <RsEmpty mode="content" />
  const q = s.quality
  return (
    <>
      <Card>
        <SectionTitle>Word count</SectionTitle>
        <Histogram bins={q.wordsHistogram} />
      </Card>
      <Card>
        <SectionTitle>Readability</SectionTitle>
        <Row label="Average" value={q.readability.avg.toFixed(1)} />
        <StackedBar segments={[
          { label: 'Hard',  count: q.readability.hard,  tone: 'warn' },
          { label: 'Mid',   count: Math.max(0, (q.readability.easy + q.readability.hard) > 0 ? 0 : 0), tone: 'neutral' },
          { label: 'Easy',  count: q.readability.easy,  tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>E-E-A-T</SectionTitle>
        <Histogram max={100} bins={[
          { label: 'Bylines',  count: Math.round(q.eeat.bylinePct),     tone: 'good' },
          { label: 'Bios',     count: Math.round(q.eeat.bioPct),        tone: 'good' },
          { label: 'Citations',count: Math.round(q.eeat.citationsPct),  tone: 'good' },
          { label: 'Updated',  count: Math.round(q.eeat.updatedVisPct), tone: 'good' },
        ]} />
      </Card>
      <Card>
        <SectionTitle>Schema</SectionTitle>
        <Histogram max={100} bins={q.schema.map(x => ({ label: x.type, count: Math.round(x.pct) }))} />
      </Card>
      <Card>
        <SectionTitle>Risks</SectionTitle>
        <Row label="Thin pages"   value={q.thinPages}   tone={q.thinPages ? 'warn' : undefined} />
        <Row label="Over-stuffed" value={q.overStuffed} tone={q.overStuffed ? 'warn' : undefined} />
        <Row label="AI-likely"    value={q.aiLikely}    tone={q.aiLikely ? 'warn' : undefined} />
      </Card>
    </>
  )
}
