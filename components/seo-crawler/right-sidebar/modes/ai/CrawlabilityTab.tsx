import React from 'react'
import { Card, Row, StackedBar, BotMatrix } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { AiStats } from '../../../../../services/right-sidebar/ai'

export function AiCrawlabilityTab({ stats: { crawlability: c } }: RsTabProps<AiStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="AI bot rules"><BotMatrix rows={c.robots} /></Card>
      <Card title="Render mix">
        <StackedBar segments={[
          { label: 'Static HTML', count: c.staticHtml,     tone: 'good' },
          { label: 'JS required', count: c.jsRequired,     tone: 'warn' },
        ]} />
        <Row label="Client-rendered pages" value={c.clientRendered} tone={c.clientRendered ? 'warn' : 'good'} />
      </Card>
    </div>
  )
}
