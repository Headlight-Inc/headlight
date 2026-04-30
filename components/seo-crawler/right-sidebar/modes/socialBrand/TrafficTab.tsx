import React from 'react'
import { Card, Row, Histogram } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { SocialBrandStats } from '../../../../../services/right-sidebar/socialBrand'

export function SocialTrafficTab({ stats: { traffic: t } }: RsTabProps<SocialBrandStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Sessions (30d)">
        <Row label="Total" value={t.socialSessions != null ? t.socialSessions.toLocaleString() : '—'}
             tone={(t.deltaPct ?? 0) >= 0 ? 'good' : 'bad'} />
        {t.deltaPct != null && <Row label="vs prev" value={`${t.deltaPct >= 0 ? '+' : ''}${(t.deltaPct * 100).toFixed(1)}%`} tone={t.deltaPct >= 0 ? 'good' : 'bad'} />}
      </Card>
      <Card title="By network">
        {t.perNetwork.length
          ? <Histogram bins={t.perNetwork.map(n => ({ label: n.network, count: n.sessions }))} />
          : <div className="text-[11px] italic text-[#555]">No per-network data.</div>}
      </Card>
      <Card title="Assisted conversions">
        <Row label="30d" value={t.assistedConversions ?? '—'} />
      </Card>
    </div>
  )
}
