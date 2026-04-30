import React from 'react'
import { Card, Row, MiniBar, StatTile } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

export function WqaContentTab({ stats }: RsTabProps<WqaStats>) {
  const c = stats.content
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Avg words" value={c.avgWords} tone={c.avgWords > 600 ? 'good' : 'warn'} />
        <StatTile label="Readability" value={c.readabilityAvg || '—'} sub="Flesch Ease" />
      </div>

      <Card title="Word count distribution">
        <MiniBar
          data={[
            { label: '<300 (Thin)', value: c.wordsHistogram[0], tone: 'bad' },
            { label: '300–800',     value: c.wordsHistogram[1], tone: 'warn' },
            { label: '800–1500',    value: c.wordsHistogram[2], tone: 'good' },
            { label: '1500–3000',   value: c.wordsHistogram[3], tone: 'good' },
            { label: '3000+',       value: c.wordsHistogram[4], tone: 'good' },
          ]}
        />
      </Card>

      <Card title="Freshness">
        <MiniBar
          data={[
            { label: '< 7 days',  value: c.freshnessHistogram[0], tone: 'good' },
            { label: '< 30 days', value: c.freshnessHistogram[1], tone: 'good' },
            { label: '< 90 days', value: c.freshnessHistogram[2], tone: 'warn' },
            { label: '< 1 year',  value: c.freshnessHistogram[3], tone: 'bad' },
            { label: '> 1 year',  value: c.freshnessHistogram[4], tone: 'bad' },
          ]}
        />
      </Card>

      <Card title="E-E-A-T signals">
        <Row label="Author byline"   value={`${c.eeat.byline}%`} />
        <Row label="Updated date"    value={`${c.eeat.updatedDate}%`} />
        <Row label="Ext. citations"  value={`${c.eeat.citations}%`} />
        <Row label="Author Bio"      value={`${c.eeat.authorBio}%`} />
      </Card>

      <Card title="Schema coverage">
        <Row label="Article" value={`${c.schemaCoverage.article}%`} />
        <Row label="Product" value={`${c.schemaCoverage.product}%`} />
        <Row label="FAQ"     value={`${c.schemaCoverage.faq}%`} />
        <Row label="HowTo"   value={`${c.schemaCoverage.howto}%`} />
      </Card>
    </div>
  )
}
