import React from 'react'
import { Card, Row, RsPartial, Histogram } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { AiStats } from '../../../../../services/right-sidebar/ai'

export function AiCitationsTab({ stats: { citations: c } }: RsTabProps<AiStats>) {
  if (c.totalCitations === 0 && c.topAnswerEngines.length === 0) {
    return <RsPartial title="Connect a brand-citation source" reason="Brandtrack, Profound or Perplexity needed for citation data." />
  }
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Citations (30d)">
        <Row label="Total citations" value={c.totalCitations} />
        <Row label="Unique domains"  value={c.uniqueDomains} />
      </Card>
      <Card title="By answer engine">
        {c.topAnswerEngines.length
          ? <Histogram bins={c.topAnswerEngines.map(e => ({ label: e.engine, count: e.citations }))} />
          : <div className="text-[11px] italic text-[#555]">No per-engine data.</div>}
      </Card>
      <Card title="Sample queries">
        {c.sampleQueries.length
          ? c.sampleQueries.slice(0, 6).map(q => <Row key={q.query} label={q.query} value={q.citationsCount} />)
          : <div className="text-[11px] italic text-[#555]">No queries.</div>}
      </Card>
    </div>
  )
}
