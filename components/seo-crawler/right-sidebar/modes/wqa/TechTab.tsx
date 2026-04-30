import React from 'react'
import { Card, Row, MiniBar, StatTile } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

export function WqaTechTab({ stats }: RsTabProps<WqaStats>) {
  const t = stats.tech
  return (
    <div className="flex flex-col gap-3">
      <Card title="Status codes">
        <MiniBar
          data={t.statusMix.map(s => ({
            label: s.code,
            value: s.count,
            tone: s.code === '2xx' ? 'good' : s.code === '3xx' ? 'warn' : 'bad'
          }))}
        />
      </Card>

      <Card title="Core Web Vitals (P50)">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="LCP" value={t.cwv.lcpP50 ? `${(t.cwv.lcpP50 / 1000).toFixed(1)}s` : '—'} tone={!t.cwv.lcpP50 || t.cwv.lcpP50 < 2500 ? 'good' : 'bad'} />
          <StatTile label="INP" value={t.cwv.inpP50 ? `${t.cwv.inpP50}ms` : '—'} tone={!t.cwv.inpP50 || t.cwv.inpP50 < 200 ? 'good' : 'bad'} />
          <StatTile label="CLS" value={t.cwv.clsP50 ? (t.cwv.clsP50 / 1000).toFixed(2) : '—'} tone={!t.cwv.clsP50 || t.cwv.clsP50 < 100 ? 'good' : 'bad'} />
        </div>
      </Card>

      <Card title="Infrastructure">
        <Row label="HTTPS"      value={`${t.httpsPct}%`} tone={t.httpsPct === 100 ? 'good' : 'bad'} />
        <Row label="Heavy (>2MB)" value={t.heavyPages}    tone={t.heavyPages > 0 ? 'bad' : 'neutral'} />
        <Row label="Slow (>2.5s)" value={t.slowPages}     tone={t.slowPages > 0 ? 'bad' : 'neutral'} />
      </Card>

      <Card title="Structure">
        <Row label="Orphans"         value={t.structural.orphans} />
        <Row label="Deep (>5 clicks)" value={t.structural.deep} />
        <Row label="Redirect chains"  value={t.structural.redirectChains} />
        <Row label="Mixed content"    value={t.structural.mixedContent} />
      </Card>

      <Card title="Indexability">
        <Row label="Indexable" value={t.indexableCount} />
        <Row label="Noindex"   value={t.noindexCount} />
        <Row label="Blocked"   value={t.blockedCount} />
        <Row label="Canon issue"value={t.canonMismatchCount} />
      </Card>
    </div>
  )
}
