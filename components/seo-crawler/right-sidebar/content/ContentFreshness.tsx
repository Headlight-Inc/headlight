import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import { Section, Card, KpiTile, EmptyState, fmtNum } from '../_shared'
import { RsBar } from '../parts/RsBar'

export function ContentFreshness() {
    const c = useContentInsights()
    if (c.total === 0) return <EmptyState title="No freshness data" hint="Update dates appear after the crawl." />

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <KpiTile label="Avg age"       value={c.freshAvg ? `${fmtNum(Math.round(c.freshAvg))}d` : '—'} />
                <KpiTile label="Stale (>1y)"   value={fmtNum(c.stale)}    tone={c.stale > 0 ? 'warn' : 'good'} />
                <KpiTile label="Decaying"      value={fmtNum(c.decaying)} tone={c.decaying > 0 ? 'warn' : 'good'} sub="losing traffic" />
                <KpiTile label="Evergreen drift" value={fmtNum(c.evergreenDrift)} tone={c.evergreenDrift > 0 ? 'warn' : 'good'} sub=">18mo" />
            </div>

            <Section title="Updated recency">
                <Card padded>
                    {c.freshBuckets.map(b => (
                        <div key={b.label} className="mb-1.5 last:mb-0">
                            <RsBar label={b.label} value={b.count} total={c.total} tone={b.tone} suffix={`· ${Math.round((b.count/c.total)*100)}%`} />
                        </div>
                    ))}
                </Card>
            </Section>
        </div>
    )
}
