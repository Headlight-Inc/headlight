import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import { Section, Card, KpiTile, EmptyState, fmtNum, fmtPct } from '../_shared'
import { RsBar } from '../parts/RsBar'

export function ContentQuality() {
    const c = useContentInsights()
    if (c.total === 0) return <EmptyState title="No quality signals yet" hint="Word count and readability appear after the crawl." />

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <KpiTile label="Median words"  value={fmtNum(c.wcMedian)} sub={`avg ${fmtNum(Math.round(c.wcAvg))}`} />
                <KpiTile label="Avg readability" value={c.readAvg ? fmtNum(c.readAvg, { maximumFractionDigits: 1 }) : '—'} sub="Flesch" />
                <KpiTile label="Thin pages"    value={fmtNum(c.thin)}        tone={c.thin > 0 ? 'warn' : 'good'} />
                <KpiTile label="Over-stuffed"  value={fmtNum(c.overstuffed)} tone={c.overstuffed > 0 ? 'warn' : 'good'} />
            </div>

            <Section title="Word count distribution">
                <Card padded>
                    {c.wcDist.map(b => (
                        <div key={b.label} className="mb-1.5 last:mb-0">
                            <RsBar label={b.label} value={b.count} total={c.total} tone={b.tone} suffix={`· ${Math.round((b.count/c.total)*100)}%`} />
                        </div>
                    ))}
                </Card>
            </Section>

            <Section title="Readability distribution">
                <Card padded>
                    {c.readDist.map(b => (
                        <div key={b.label} className="mb-1.5 last:mb-0">
                            <RsBar label={b.label} value={b.count} total={c.total} tone={b.tone} />
                        </div>
                    ))}
                </Card>
            </Section>

            <Section title="AI & originality flags">
                <Card padded>
                    <div className="grid grid-cols-2 gap-2">
                        <KpiTile label="AI-likely"     value={fmtNum(c.aiLikely)}      tone={c.aiLikely > 0 ? 'warn' : 'neutral'} sub="≥70% likelihood" />
                        <KpiTile label="Low originality" value={fmtNum(c.lowOriginality)} tone={c.lowOriginality > 0 ? 'warn' : 'neutral'} sub="<40 score" />
                    </div>
                </Card>
            </Section>
        </div>
    )
}
