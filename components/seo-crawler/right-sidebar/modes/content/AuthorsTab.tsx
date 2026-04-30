import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { ContentStats } from '../../../../../services/right-sidebar/content'

export function ContentAuthorsTab({ stats: { authors } }: RsTabProps<ContentStats>) {
  if (!authors.length) {
    return (
      <div className="p-3 text-[11px] italic text-[#666]">
        {'No author metadata detected. Add `<meta name="author">` or schema `Person.author` to surface here.'}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Top authors">
        {authors.map(a => (
          <Row key={a.name} label={`${a.name} · ${a.pages} pages`} value={`Q ${a.avgScore}`} tone={a.avgScore >= 70 ? 'good' : a.avgScore >= 50 ? 'warn' : 'bad'} />
        ))}
      </Card>
    </div>
  )
}
