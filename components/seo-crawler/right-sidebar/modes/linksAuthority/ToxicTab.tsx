import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LinksAuthorityStats } from '../../../../../services/right-sidebar/linksAuthority'

export function LinksToxicTab({ stats: { toxic: t } }: RsTabProps<LinksAuthorityStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Toxicity">
        <Row label="Toxic domains" value={t.domains}      tone={t.domains      ? 'bad' : 'good'} />
        <Row label="Spam page %"   value={`${t.spamPagesPct}%`} tone={t.spamPagesPct >= 5 ? 'bad' : 'good'} />
      </Card>
      <Card title="Top offenders">
        {t.topToxic.length ? t.topToxic.map(d => <Row key={d.domain} label={d.domain} value={d.score} tone="bad" />)
                            : <div className="text-[11px] italic text-[#555]">No toxic domains detected.</div>}
      </Card>
    </div>
  )
}
