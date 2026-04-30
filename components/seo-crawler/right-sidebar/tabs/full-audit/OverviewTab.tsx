import React from 'react'
import { Card } from '../../primitives/Card'
import { KpiTile } from '../../primitives/KpiTile'
import { Gauge } from '../../primitives/Gauge'
import { Bars } from '../../primitives/Bars'
import { Distribution } from '../../primitives/Distribution'
import { StatRow } from '../../primitives/StatRow'
import { useFullAuditRsData } from '../../selectors/useFullAuditRsData'

const STATUS_TONE: Record<string, 'good' | 'warn' | 'bad' | 'info' | 'neutral'> = {
    '2xx': 'good', '3xx': 'info', '4xx': 'bad', '5xx': 'bad', other: 'neutral',
}

export default function OverviewTab() {
    const d = useFullAuditRsData()

    return (
        <div className="px-2.5 pt-2.5 pb-6">
            <Card title="Site score">
                <Gauge score={d.scores.overall} label="Quality" />
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <KpiTile label="Pages"    value={d.counts.total.toLocaleString()} />
                    <KpiTile label="Indexable %"
                             value={d.counts.total ? `${Math.round((d.counts.indexable / d.counts.total) * 100)}%` : '—'}
                             accent={d.counts.indexable / Math.max(1, d.counts.total) >= 0.8 ? 'good' : 'warn'} />
                    <KpiTile label="Issues"   value={(d.issues.critical + d.issues.high + d.issues.medium + d.issues.low).toLocaleString()}
                             accent={d.issues.critical > 0 ? 'bad' : d.issues.high > 0 ? 'warn' : 'good'} />
                    <KpiTile label="New (this session)" value={d.issues.new} />
                </div>
            </Card>

            <Card title="Status mix">
                <Bars
                    items={d.statusMix.map(s => ({ label: s.bucket, value: s.value, tone: STATUS_TONE[s.bucket] }))}
                />
            </Card>

            <Card title="Click depth">
                <Distribution buckets={d.depth} />
            </Card>

            <Card title="Templates">
                {d.template.length === 0
                    ? <div className="text-[11px] text-[#666]">No template signals yet.</div>
                    : <Bars items={d.template.map(t => ({ label: t.label, value: t.value, tone: 'info' }))} />}
            </Card>

            <Card title="Crawl summary">
                <StatRow label="Last crawl" value={d.crawl.lastRunAt ? new Date(d.crawl.lastRunAt).toLocaleString() : '—'} />
                <StatRow label="Pages crawled" value={d.crawl.pages.toLocaleString()} sub={` / ${d.crawl.budget.toLocaleString()}`} />
                <StatRow label="Avg response" value={`${d.crawl.avgMs}ms`} tone={d.crawl.avgMs > 800 ? 'warn' : 'good'} />
                <StatRow label="p90 / p99"    value={`${d.crawl.p90Ms}ms / ${d.crawl.p99Ms}ms`}
                         tone={d.crawl.p99Ms > 3000 ? 'bad' : d.crawl.p90Ms > 1500 ? 'warn' : 'good'} />
            </Card>
        </div>
    )
}
