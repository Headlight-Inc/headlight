import React from 'react'
import { Card, Row, StackedBar } from '../../shared'
import type { RsTabProps } from '../../../../../services/right-sidebar/types'
import type { SocialBrandStats } from '../../../../../services/right-sidebar/socialBrand'

export function SocialMentionsTab({ stats: { mentions: m } }: RsTabProps<SocialBrandStats>) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Card title="Sentiment">
        <StackedBar segments={[
          { label: 'Positive', count: m.positive, tone: 'good' },
          { label: 'Neutral',  count: m.neutral,  tone: 'neutral' },
          { label: 'Negative', count: m.negative, tone: 'bad' },
        ]} />
      </Card>
      <Card title="Top influencers">
        {m.topInfluencers.length
          ? m.topInfluencers.slice(0, 6).map(i => <Row key={i.name} label={i.name} value={`reach ${i.reach.toLocaleString()}`} />)
          : <div className="text-[11px] italic text-[#555]">No influencer data.</div>}
      </Card>
      <Card title="Top mention URLs">
        {m.topUrls.length
          ? m.topUrls.slice(0, 6).map(u => <Row key={u.url} label={shortHost(u.url)} value={u.mentions} />)
          : <div className="text-[11px] italic text-[#555]">No mention URLs.</div>}
      </Card>
    </div>
  )
}
function shortHost(u: string) { try { return new URL(u).host } catch { return u } }
