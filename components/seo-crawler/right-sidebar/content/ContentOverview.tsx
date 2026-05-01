import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import {
    Section, Card, KpiTile, ScoreGauge, Distribution, DeltaChip, Sparkline, EmptyState,
    fmtNum, fmtPct, compactNum,
} from '../_shared'
import { RsRow } from '../parts/RsRow'

export function ContentOverview() {
    const c = useContentInsights()
    if (c.total === 0) {
        return <EmptyState title="No content data" hint="Run a crawl to score content quality." />
    }

    const delta = c.qOverall - c.qPrev
    const deltaTone: 'up' | 'down' | 'flat' = delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat'
    const catRows = Object.entries(c.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, count]) => ({ label: cap(label), value: Math.round((count / c.total) * 100) }))
    const langRows = Object.entries(c.langs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, count]) => ({ label: label.toUpperCase(), value: Math.round((count / c.total) * 100) }))

    return (
        <div className="space-y-3">
            <Section title="Site content score">
                <Card padded>
                    <div className="flex items-center gap-3">
                        <ScoreGauge value={Math.round(c.qOverall)} size={72} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[22px] font-bold text-white tabular-nums">{Math.round(c.qOverall)}</span>
                                <span className="text-[11px] text-[#666]">/ 100</span>
                                <DeltaChip value={delta} tone={deltaTone} suffix=" pts" />
                            </div>
                            <div className="mt-1 text-[10px] text-[#666] uppercase tracking-widest">vs previous session</div>
                            {c.trend.length > 1 && (
                                <div className="mt-2"><Sparkline values={c.trend} height={20} /></div>
                            )}
                        </div>
                    </div>
                </Card>
            </Section>

            <div className="grid grid-cols-2 gap-2">
                <KpiTile label="Pages"           value={compactNum(c.total)}       sub="indexable HTML" />
                <KpiTile label="Indexable"       value={compactNum(c.indexable)}   sub={`${Math.round((c.indexable/c.total)*100)}% of total`} />
                <KpiTile label="Median words"    value={fmtNum(c.wcMedian)}        sub={`avg ${fmtNum(Math.round(c.wcAvg))}`} />
                <KpiTile label="Topic clusters"  value={fmtNum(c.clusterRows.length)} sub={`${c.weakHubs} weak`} tone={c.weakHubs > 0 ? 'warn' : 'neutral'} />
            </div>

            {catRows.length > 0 && (
                <Section title="Category mix">
                    <Card padded><Distribution rows={catRows} /></Card>
                </Section>
            )}

            {langRows.length > 1 && (
                <Section title="Languages">
                    <Card padded><Distribution rows={langRows} /></Card>
                </Section>
            )}

            <Section title="Top gaps">
                <Card padded>
                    <RsRow label="Thin pages"        value={fmtNum(c.thin)}        tone={c.thin > 0 ? 'warn' : 'good'} />
                    <RsRow label="Duplicates"        value={fmtNum(c.dupes)}       tone={c.dupes > 0 ? 'warn' : 'good'} />
                    <RsRow label="Cannibalisation"   value={fmtNum(c.cannibal)}    tone={c.cannibal > 0 ? 'warn' : 'good'} />
                    <RsRow label="Stale (>1y)"       value={fmtNum(c.stale)}       tone={c.stale > 0 ? 'warn' : 'good'} />
                    <RsRow label="Schema coverage"   value={fmtPct(c.schemaCoverage.any, 1, 0)} tone={c.schemaCoverage.any >= 60 ? 'good' : 'warn'} />
                    <RsRow label="Bylines"           value={fmtPct(c.eeat.bylines, 1, 0)} tone={c.eeat.bylines >= 70 ? 'good' : 'warn'} />
                </Card>
            </Section>

            {c.alerts.length > 0 && (
                <Section title="Alerts">
                    <Card padded>
                        <ul className="space-y-1">
                            {c.alerts.slice(0, 6).map((a, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${a.tone === 'bad' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'}`} />
                                    <span className="text-[11px] text-[#ddd] leading-snug">{a.text}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Section>
            )}
        </div>
    )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
