import React from 'react'
import { Card, Row, Chip } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { LocalStats } from '../../../../../services/right-sidebar/local'

export function LocalGbpTab({ stats: { gbp: g } }: RsTabProps<LocalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Profile">
        <Row label="Name"     value={g.name ?? '—'} />
        <Row label="Verified" value={g.verified ? '✓' : '—'} tone={g.verified ? 'good' : 'bad'} />
        <Row label="Phone"    value={g.phone ?? '—'} />
        <Row label="Website"  value={g.website ?? '—'} />
        <Row label="Hours complete" value={g.hoursComplete ? '✓' : '—'} tone={g.hoursComplete ? 'good' : 'warn'} />
      </Card>
      <Card title="Categories">
        <div className="flex flex-wrap gap-1">
          {g.categoryPrimary && <Chip tone="good">{g.categoryPrimary}</Chip>}
          {g.categories.filter(c => c !== g.categoryPrimary).slice(0, 6).map(c => <Chip key={c}>{c}</Chip>)}
          {g.categories.length === 0 && <div className="text-[11px] italic text-[#555]">No categories set.</div>}
        </div>
      </Card>
      <Card title="Activity">
        <Row label="Posts (30d)" value={g.postsLast30} tone={g.postsLast30 >= 4 ? 'good' : 'warn'} />
        <Row label="Photos"      value={g.photosCount} />
      </Card>
    </div>
  )
}
