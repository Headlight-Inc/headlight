import React from 'react'
import { Card, Row, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function WqaContentTab({ stats }: RsTabProps<WqaStats>) {
  const c = stats.content
  return (
    <div className="flex flex-col gap-3">
      <Card title="Coverage" right={<SourceChip source={SRC} />}>
        <Row label="With title"       value={c.withTitle} />
        <Row label="With description" value={c.withDesc} />
        <Row label="With H1"          value={c.withH1} />
        <Row label="Thin (<300 words)" value={c.thin} tone={c.thin === 0 ? 'good' : 'warn'} />
      </Card>
      <Card title="Quality">
        <Row label="Avg words / page"        value={c.avgWords} tone={c.avgWords >= 600 ? 'good' : c.avgWords >= 300 ? 'warn' : 'bad'} />
        <Row label="Duplicate titles"         value={c.dupTitles} tone={c.dupTitles === 0 ? 'good' : 'bad'} />
        <Row label="Duplicate descriptions"   value={c.dupDescriptions} tone={c.dupDescriptions === 0 ? 'good' : 'bad'} />
      </Card>
    </div>
  )
}
