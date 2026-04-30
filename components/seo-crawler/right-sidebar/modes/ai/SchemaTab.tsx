import React from 'react'
import { Card, Row, Histogram } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { AiStats } from '../../../../../services/right-sidebar/ai'

export function AiSchemaTab({ stats: { schema: s } }: RsTabProps<AiStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Types">
        {s.byType.length
          ? <Histogram bins={s.byType.map(t => ({ label: t.type, count: t.count }))} />
          : <div className="text-[11px] italic text-[#555]">No structured data detected.</div>}
      </Card>
      <Card title="Coverage">
        <Row label="FAQPage"      value={s.faqPages} />
        <Row label="HowTo"        value={s.howToPages} />
        <Row label="Article"      value={s.articlePages} />
        <Row label="Missing Product" value={s.missingProductSchema} tone={s.missingProductSchema ? 'warn' : 'good'} />
        <Row label="Broken schema"  value={s.brokenSchema}        tone={s.brokenSchema        ? 'bad'  : 'good'} />
      </Card>
    </div>
  )
}
