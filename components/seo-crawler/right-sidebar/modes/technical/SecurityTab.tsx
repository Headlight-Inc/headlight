import React from 'react'
import { Card, Row, ProgressBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { TechnicalStats } from '../../../../../services/right-sidebar/technical'

export function TechSecurityTab({ stats: { security: s } }: RsTabProps<TechnicalStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Encryption">
        <Row label="HTTPS" value={`${s.httpsPct}%`} tone={s.httpsPct >= 99 ? 'good' : 'bad'} />
        <ProgressBar value={s.httpsPct} max={100} />
        <Row label="Mixed content pages" value={s.mixedContentPages} tone={s.mixedContentPages ? 'bad' : 'good'} />
        <Row label="Weak TLS"            value={s.sslWeak}           tone={s.sslWeak           ? 'bad' : 'good'} />
      </Card>
      <Card title="Headers">
        <Row label="HSTS coverage" value={s.hsts} tone={s.hsts ? 'good' : 'warn'} />
        <Row label="CSP coverage"  value={s.csp}  tone={s.csp  ? 'good' : 'warn'} />
      </Card>
      <Card title="Exposed secrets">
        <Row label="Pages with API keys in source" value={s.exposedKeys} tone={s.exposedKeys ? 'bad' : 'good'} />
      </Card>
    </div>
  )
}
