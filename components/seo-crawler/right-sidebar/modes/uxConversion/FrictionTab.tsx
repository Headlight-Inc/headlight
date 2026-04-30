import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { UxConversionStats } from '../../../../../services/right-sidebar/uxConversion'

export function UxFrictionTab({ stats: { friction: f } }: RsTabProps<UxConversionStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Signals">
        <Row label="Rage clicks (pages)" value={f.rageClicks} tone={f.rageClicks ? 'warn' : 'good'} />
        <Row label="Dead clicks (pages)" value={f.deadClicks} tone={f.deadClicks ? 'warn' : 'good'} />
        <Row label="Error pages"         value={f.errorPages} tone={f.errorPages ? 'bad'  : 'good'} />
        <Row label="Form abandon rate"   value={`${f.formAbandonRate}%`} tone={f.formAbandonRate >= 50 ? 'bad' : f.formAbandonRate >= 30 ? 'warn' : 'good'} />
      </Card>
      {f.topRageUrls.length > 0 && (
        <Card title="Top rage URLs">
          {f.topRageUrls.slice(0, 5).map(u => <Row key={u.url} label={shortUrl(u.url)} value={u.clicks} tone="warn" />)}
        </Card>
      )}
      {f.topDeadUrls.length > 0 && (
        <Card title="Top dead-click URLs">
          {f.topDeadUrls.slice(0, 5).map(u => <Row key={u.url} label={shortUrl(u.url)} value={u.clicks} />)}
        </Card>
      )}
    </div>
  )
}
function shortUrl(u: string) { try { const x = new URL(u); return x.pathname || u } catch { return u } }
