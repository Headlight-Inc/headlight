import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

export function PaidQualityTab({ stats }: RsTabProps<PaidStats>) {
  const q = stats.quality
  const SRC = { tier: 'scrape', name: 'Crawler (LPs)' } as const
  return (
    <Card title="Landing-page quality" right={<SourceChip source={SRC} />}>
      {q.avgQualityScore != null && <Row label="Quality Score (avg)" value={`${q.avgQualityScore.toFixed(1)}/10`} />}
      <Row label="LP score (composite)" value={`${q.landingPageScoreAvg}/100`} tone={q.landingPageScoreAvg >= 75 ? 'good' : 'warn'} />
      <ProgressBar value={q.landingPageScoreAvg} max={100} tone={q.landingPageScoreAvg >= 75 ? 'good' : 'warn'} />
      <Row label="Slow LPs (>2.5s)" value={q.slowLandingPages} tone={q.slowLandingPages === 0 ? 'good' : 'warn'} />
      <Row label="Mobile-friendly LPs" value={`${q.mobileLandingPages} / ${q.landingPagesTotal}`} />
    </Card>
  )
}
