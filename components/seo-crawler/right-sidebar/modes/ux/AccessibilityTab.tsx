import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { UxConversionStats } from '@/services/right-sidebar/uxConversion'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function UxAccessibilityTab({ stats }: RsTabProps<UxConversionStats>) {
  const a = stats.accessibility
  return (
    <div className="flex flex-col gap-3">
      <Card title="Images" right={<SourceChip source={SRC} />}>
        <Row label="Alt coverage" value={`${a.altCoveragePct}%`} tone={a.altCoveragePct >= 90 ? 'good' : 'warn'} />
        <ProgressBar value={a.altCoveragePct} max={100} tone={a.altCoveragePct >= 90 ? 'good' : 'warn'} />
        <Row label="Images total"        value={a.imgsTotal} />
        <Row label="Images missing alt"  value={a.imgsMissingAlt} tone={a.imgsMissingAlt === 0 ? 'good' : 'warn'} />
      </Card>
      <Card title="Other a11y issues">
        <Row label="Contrast issues"            value={a.contrastIssues}        tone={a.contrastIssues === 0 ? 'good' : 'bad'} />
        <Row label="Forms without labels"        value={a.formsWithoutLabels}    tone={a.formsWithoutLabels === 0 ? 'good' : 'warn'} />
        <Row label="Pages without lang attribute" value={a.pagesWithoutLangAttr} tone={a.pagesWithoutLangAttr === 0 ? 'good' : 'warn'} />
        <Row label="ARIA issues"                  value={a.ariaIssues}            tone={a.ariaIssues === 0 ? 'good' : 'warn'} />
      </Card>
    </div>
  )
}
