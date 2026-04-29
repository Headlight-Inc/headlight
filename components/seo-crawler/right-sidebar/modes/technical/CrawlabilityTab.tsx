import React from 'react'
import { Card, Row, Bar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function TechCrawlabilityTab({ stats }: RsTabProps<TechnicalStats>) {
  const c = stats.crawl
  return (
    <div className="flex flex-col gap-3">
      <Card title="Orphans & redirects" right={<SourceChip source={SRC} />}>
        <Row label="Orphan pages"     value={c.orphans}             tone={c.orphans === 0 ? 'good' : 'warn'} />
        <Row label="Redirects (3xx)"  value={c.redirects.total} />
        <Row label="Redirect chains"  value={c.redirects.chains}    tone={c.redirects.chains === 0 ? 'good' : 'warn'} />
        <Row label="Redirect loops"   value={c.redirects.loops}     tone={c.redirects.loops === 0 ? 'good' : 'bad'} />
        <Row label="Broken links"     value={c.brokenLinks}         tone={c.brokenLinks === 0 ? 'good' : 'bad'} />
      </Card>
      <Card title="Depth distribution">
        <Bar data={c.depthHistogram.map((v, d) => ({ label: d === 6 ? '6+' : `${d}`, value: v }))} />
      </Card>
    </div>
  )
}
