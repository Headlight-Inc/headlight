import React from 'react'
import { useRsStats } from '../../shared/useRsStats'
import { Card, Row, SectionTitle, ActionsList, RsPartial, RsEmpty } from '../../shared'
import { KpiStrip, MoverList, ScoreBreakdown, ForecastPill, AuctionMatrix, BotMatrix, NapGrid, OgPreviewCard } from '../../shared'
import { Histogram, Waffle, MiniTreemap, BestTimeHeatmap, FunnelBar, Sparkline, StackedBar, Donut } from '../../shared/charts'

export function Actions() {
  const s = useRsStats('socialBrand'); if (!s) return <RsEmpty mode="socialBrand" />
  const sample = s.metaAudit.pages[0]
  return (
    <>
      <Card>
        <SectionTitle>OG / Twitter audit</SectionTitle>
        <Histogram bins={[
          { label: 'Missing og:image', count: s.metaAudit.summary.missingOgImage,    tone: 'warn' },
          { label: 'Missing twitter',  count: s.metaAudit.summary.missingTwitterCard, tone: 'warn' },
          { label: 'Wrong ratio',      count: s.metaAudit.summary.wrongRatio,        tone: 'warn' },
          { label: 'Full miss',        count: s.metaAudit.summary.fullMiss,          tone: 'bad' },
        ]} />
      </Card>
      {sample && (
        <Card>
          <SectionTitle>Preview</SectionTitle>
          <OgPreviewCard og={{ url: sample.url, title: sample.ogTitle ? '✓' : undefined, description: sample.ogDesc ? '✓' : undefined, image: sample.ogImage ? '' : null, warnings: sample.warnings }}  />
        </Card>
      )}
      <Card>
        <SectionTitle>Recommended actions</SectionTitle>
        <ActionsList actions={s.actions} />
      </Card>
      <Card>
        <SectionTitle>Forecast</SectionTitle>
        {s.actions.filter(a => a.forecast).slice(0, 4).map(a =>
          <ForecastPill key={a.id} f={{ label: a.label, deltaValue: a.forecast!.deltaValue, unit: a.forecast!.unit, confidencePct: a.forecast!.confidencePct, positiveIsGood: a.forecast!.positiveIsGood }}  />
        )}
      </Card>
    </>
  )
}
