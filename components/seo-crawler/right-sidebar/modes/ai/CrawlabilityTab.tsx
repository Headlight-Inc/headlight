import React from 'react'
import { Card, Row, ProgressBar, Chip, SourceChip, FreshnessChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function AiCrawlabilityTab({ stats }: RsTabProps<AiStats>) {
  const c = stats.crawlability
  return (
    <div className="flex flex-col gap-3">
      <Card title="llms.txt" right={<><SourceChip source={{ tier: 'free-api', name: 'llms.txt' }} /><FreshnessChip at={c.llmsTxtParsedAt} /></>}>
        <Row label="Status" value={c.hasLlmsTxt ? 'present' : 'missing'} tone={c.hasLlmsTxt ? 'good' : 'bad'} />
      </Card>
      <Card title="AI bot access" right={<SourceChip source={{ tier: 'free-api', name: 'robots.txt' }} />}>
        <div className="flex flex-wrap gap-1">
          {c.botRules.map(b => <Chip key={b.bot} tone={b.allowed ? 'good' : 'bad'} dense>{b.bot}: {b.allowed ? 'allow' : 'block'}</Chip>)}
        </div>
      </Card>
      <Card title="Rendering">
        <Row label="JS-only pages"            value={`${c.jsOnlyPagesPct}%`} tone={c.jsOnlyPagesPct < 20 ? 'good' : 'warn'} />
        <ProgressBar value={c.jsOnlyPagesPct} max={100} tone={c.jsOnlyPagesPct < 20 ? 'good' : 'warn'} />
        <Row label="Structured-only pages"    value={`${c.structuredOnlyPagesPct}%`} />
      </Card>
    </div>
  )
}
