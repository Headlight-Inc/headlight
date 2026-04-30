import React from 'react'
import { Card, Row, Histogram, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { WqaStats } from '../../../../../services/right-sidebar/wqa'
import { pct } from '../../../../../services/right-sidebar/utils'

export function WqaContentTab({ stats }: RsTabProps<WqaStats>) {
  const c = stats.content
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Coverage">
        <Row label="Titles"        value={`${pct(c.withTitle, stats.pages)}%`} />
        <ProgressBar value={pct(c.withTitle, stats.pages)} max={100} />
        <Row label="Descriptions"  value={`${pct(c.withDesc, stats.pages)}%`} />
        <ProgressBar value={pct(c.withDesc, stats.pages)} max={100} />
        <Row label="H1"            value={`${pct(c.withH1, stats.pages)}%`} />
        <ProgressBar value={pct(c.withH1, stats.pages)} max={100} />
      </Card>
      <Card title="Quality">
        <Row label="Avg words"               value={c.avgWords} tone={c.avgWords >= 600 ? 'good' : c.avgWords >= 300 ? 'warn' : 'bad'} />
        <Row label="Thin pages"              value={c.thin} tone={c.thin === 0 ? 'good' : 'warn'} />
        <Row label="Readability (median)"    value={c.readabilityAvg ?? '—'} />
        <Row label="Duplicate titles"        value={c.dupTitles}        tone={c.dupTitles === 0 ? 'good' : 'bad'} />
        <Row label="Duplicate descriptions"  value={c.dupDescriptions}  tone={c.dupDescriptions === 0 ? 'good' : 'bad'} />
      </Card>
      <Card title="Word count"><Histogram bins={c.wordsHistogram.map(b => ({ label: b.label, count: b.count }))} /></Card>
      <Card title="Freshness"><Histogram bins={c.freshnessHistogram.map(b => ({ label: b.label, count: b.count }))} /></Card>
    </div>
  )
}
