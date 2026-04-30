import React from 'react'
import { Card } from '../../primitives/Card'
import { KpiTile } from '../../primitives/KpiTile'
import { StatRow } from '../../primitives/StatRow'
import { Bars } from '../../primitives/Bars'
import { Donut } from '../../primitives/Donut'
import { useFullAuditRsData } from '../../selectors/useFullAuditRsData'

export default function CrawlHealthTab() {
    const d = useFullAuditRsData()

    const errBars = [
        { label: 'Timeout',  value: d.crawl.errors.timeout, tone: 'bad' as const },
        { label: 'Server',   value: d.crawl.errors.server,  tone: 'bad' as const },
        { label: 'Parse',    value: d.crawl.errors.parse,   tone: 'warn' as const },
        { label: 'DNS',      value: d.crawl.errors.dns,     tone: 'warn' as const },
    ].filter(b => b.value > 0)

    const blockedBars = [
        { label: 'robots.txt', value: d.crawl.blocked.robots,    tone: 'warn' as const },
        { label: 'meta',       value: d.crawl.blocked.meta,      tone: 'warn' as const },
        { label: '403',        value: d.crawl.blocked.forbidden, tone: 'bad'  as const },
    ].filter(b => b.value > 0)

    return (
        <div className="px-2.5 pt-2.5 pb-6">
            <Card title="Last crawl">
                <StatRow label="Started"       value={d.crawl.lastRunAt ? new Date(d.crawl.lastRunAt).toLocaleString() : '—'} />
                <StatRow label="Duration"      value={d.crawl.durationMs ? `${Math.round(d.crawl.durationMs / 1000)}s` : '—'} />
                <StatRow label="Pages / budget" value={`${d.crawl.pages.toLocaleString()} / ${d.crawl.budget.toLocaleString()}`} />
            </Card>

            <Card title="Throughput">
                <div className="grid grid-cols-2 gap-2">
                    <KpiTile label="Avg ms"  value={d.crawl.avgMs} accent={d.crawl.avgMs > 800 ? 'warn' : 'good'} />
                    <KpiTile label="p90 ms"  value={d.crawl.p90Ms} accent={d.crawl.p90Ms > 1500 ? 'warn' : 'good'} />
                    <KpiTile label="p99 ms"  value={d.crawl.p99Ms} accent={d.crawl.p99Ms > 3000 ? 'bad'  : 'good'} />
                    <KpiTile label="Pages"   value={d.crawl.pages.toLocaleString()} />
                </div>
            </Card>

            <Card title="Errors">
                {errBars.length === 0
                    ? <div className="text-[11px] text-emerald-400">No errors in this crawl.</div>
                    : <Bars items={errBars} />}
            </Card>

            <Card title="Blocked">
                {blockedBars.length === 0
                    ? <div className="text-[11px] text-[#666]">Nothing blocked.</div>
                    : <Bars items={blockedBars} />}
            </Card>

            <Card title="Sitemap parity">
                <StatRow label="In sitemap & crawled" value={d.crawl.sitemapParity.matched.toLocaleString()} tone="good" />
                <StatRow label="In crawl only"        value={d.crawl.sitemapParity.crawlOnly.toLocaleString()} tone="warn" />
                <StatRow label="In sitemap only"      value={d.crawl.sitemapParity.sitemapOnly.toLocaleString()} tone="warn" />
            </Card>

            <Card title="Render mix">
                <Donut
                    slices={[
                        { label: 'Static', value: d.crawl.renderMix.static, color: '#34d399' },
                        { label: 'SSR',    value: d.crawl.renderMix.ssr,    color: '#60a5fa' },
                        { label: 'CSR',    value: d.crawl.renderMix.csr,    color: '#f97316' },
                    ]}
                />
            </Card>
        </div>
    )
}
