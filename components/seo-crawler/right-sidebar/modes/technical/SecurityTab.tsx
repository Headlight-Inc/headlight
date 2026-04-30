import React from 'react'
import { Card, Row, ProgressBar, SourceChip } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

const SRC = { tier: 'scrape', name: 'Crawler' } as const

export function TechSecurityTab({ stats }: RsTabProps<TechnicalStats>) {
  const s = stats.security
  return (
    <Card title="Security posture" right={<SourceChip source={SRC} />}>
      <Row label="HTTPS" value={`${s.httpsPct}%`} tone={s.httpsPct >= 95 ? 'good' : 'bad'} />
      <ProgressBar value={s.httpsPct} max={100} tone={s.httpsPct >= 95 ? 'good' : 'bad'} />
      <Row label="Mixed-content pages"        value={s.mixedContentPages}    tone={s.mixedContentPages === 0 ? 'good' : 'bad'} />
      <Row label="HSTS pages"                  value={s.hstsPages} />
      <Row label="CSP pages"                   value={s.cspPages} />
      <Row label="Insecure cookies"            value={s.cookiesWithoutSecure} tone={s.cookiesWithoutSecure === 0 ? 'good' : 'warn'} />
    </Card>
  )
}
