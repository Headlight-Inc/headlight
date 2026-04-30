import React from 'react'
import { Card, Row, MiniBar, Sparkline, KpiTile } from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaStats } from '@/services/right-sidebar/wqa'

export function WqaSearchTab({ stats }: RsTabProps<WqaStats>) {
  const s = stats.search
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <KpiTile label="Clicks" value={s.clicks28d.toLocaleString()} trend={s.clicks28dDelta} />
        <KpiTile label="Impr." value={s.impr28d.toLocaleString()} trend={s.impr28dDelta} />
      </div>

      <Card title="Traffic trend (28d)">
        <div className="h-16">
          <Sparkline data={s.clicksSeries} />
        </div>
        <div className="flex justify-between text-[9px] text-[#555] mt-1 uppercase font-mono">
          <span>28d ago</span>
          <span>Today</span>
        </div>
      </Card>

      <Card title="Keyword buckets">
        <MiniBar
          data={[
            { label: 'Top 3',      value: s.keywordBuckets.top3,      tone: 'good' },
            { label: 'Top 10',     value: s.keywordBuckets.top10,     tone: 'good' },
            { label: 'Striking',   value: s.keywordBuckets.striking,  tone: 'warn' },
            { label: 'Tail (21+)', value: s.keywordBuckets.tail,      tone: 'neutral' },
            { label: 'Unranked',   value: s.keywordBuckets.notRanking,tone: 'bad' },
          ]}
        />
      </Card>

      <Card title="Lost pages (Top 6)">
        <div className="flex flex-col gap-1.5">
          {s.lostPages.length > 0 ? s.lostPages.map(p => (
            <div key={p.url} className="text-[10px] text-red-400 font-mono truncate">{p.url}</div>
          )) : (
            <div className="text-[10px] text-[#555] italic">No high-value losses detected</div>
          )}
        </div>
      </Card>

      <Card title="CTR vs Benchmark">
        <div className="space-y-3">
          {s.ctrVsBenchmark.map(b => (
            <div key={b.pos} className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase text-[#666]">
                <span>Position {b.pos}</span>
                <span className={b.us >= b.benchmark ? 'text-green-400' : 'text-red-400'}>
                  {(b.us * 100).toFixed(1)}% vs {(b.benchmark * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#111] rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500/50" style={ { width: `${b.benchmark * 100}%` } } />
                <div className="h-full bg-violet-500 absolute" style={ { width: `${b.us * 100}%` } } />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
