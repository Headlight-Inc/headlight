import React from 'react'
import { Card, Row } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { PaidStats } from '../../../../../services/right-sidebar/paid'

export function PaidQualityTab({ stats: { quality: q } }: RsTabProps<PaidStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Auction quality">
        <Row label="Avg Quality Score" value={q.qualityScoreAvg != null ? q.qualityScoreAvg.toFixed(1) : '—'} tone={(q.qualityScoreAvg ?? 0) >= 7 ? 'good' : (q.qualityScoreAvg ?? 0) >= 5 ? 'warn' : 'bad'} />
        <Row label="Avg CTR"           value={q.ctrAvg != null ? `${(q.ctrAvg * 100).toFixed(2)}%` : '—'} />
        <Row label="LP experience"     value={q.lpExperience ?? '—'} tone={q.lpExperience === 'aboveAvg' ? 'good' : q.lpExperience === 'avg' ? 'warn' : q.lpExperience === 'belowAvg' ? 'bad' : 'neutral'} />
      </Card>
      <Card title="Landing-page CWV">
        <Row label="CWV pass rate (top 5)" value={`${q.cwvPassRate}%`} tone={q.cwvPassRate >= 75 ? 'good' : q.cwvPassRate >= 50 ? 'warn' : 'bad'} />
        {q.lpExp.length
          ? q.lpExp.map(p => <Row key={p.url} label={shortUrl(p.url)} value={`LCP ${p.lcpMs ?? '—'} · CLS ${p.cls ?? '—'}`} tone={p.tone} />)
          : <div className="text-[11px] italic text-[#555]">No ad landing pages crawled yet.</div>}
      </Card>
    </div>
  )
}
function shortUrl(u: string) { try { return new URL(u).pathname } catch { return u } }
