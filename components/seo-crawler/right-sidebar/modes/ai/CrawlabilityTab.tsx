import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Crawlability() {
  const s = useRsStats('ai'); if (!s) return <RsEmpty mode="ai" />
  const c = s.crawlability
  return (
    <>
      <Card>
        <SectionTitle>Bot policy matrix</SectionTitle>
        <BotMatrix rows={c.botRules} />
      </Card>
      <Card>
        <SectionTitle>AI affordances</SectionTitle>
        <Row label="llms.txt"          value={c.llmsTxt ? 'present' : 'missing'} tone={c.llmsTxt ? 'good' : 'warn'} />
        <Row label="llms-full.txt"     value={c.llmsFullTxt ? 'present' : 'missing'} tone={c.llmsFullTxt ? 'good' : 'neutral'} />
        <Row label="ai.txt"            value={c.aiTxt ? 'present' : 'missing'} tone={c.aiTxt ? 'good' : 'neutral'} />
        <Row label="Rate-limit headers" value={c.rateLimitHeadersPresent ? 'yes' : 'no'} tone={c.rateLimitHeadersPresent ? 'good' : 'warn'} />
      </Card>
    </>
  )
}
