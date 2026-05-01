import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import { Section, Card, KpiTile, EmptyState, fmtNum, fmtPct } from '../_shared'
import { RsBar } from '../parts/RsBar'
import { RsRow } from '../parts/RsRow'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'

export function ContentTopics() {
    const c = useContentInsights()
    const { setSelections } = useSeoCrawler() as any
    if (c.total === 0) return <EmptyState title="No topics yet" hint="Topic clusters appear after AI analysis runs." />

    const top = c.clusterRows.slice(0, 8)
    const intentRows = Object.entries(c.intentMix)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, v]) => ({ label: cap(k), count: v, value: Math.round((v / c.total) * 100) }))

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <KpiTile label="Clusters"     value={fmtNum(c.clusterRows.length)} />
                <KpiTile label="Weak hubs"    value={fmtNum(c.weakHubs)}    tone={c.weakHubs > 0 ? 'warn' : 'neutral'} />
                <KpiTile label="Orphan topics" value={fmtNum(c.orphanTopics)} sub="≤2 pages" />
                <KpiTile label="Cannibalising" value={fmtNum(c.cannibal)}    tone={c.cannibal > 0 ? 'warn' : 'neutral'} />
            </div>

            {top.length > 0 && (
                <Section title="Top clusters">
                    <Card padded>
                        <ul className="space-y-2">
                            {top.map(cl => (
                                <li
                                    key={cl.name}
                                    className="cursor-pointer hover:bg-[#141414] rounded p-1.5 -mx-1.5 transition-colors"
                                    onClick={() => setSelections?.({ 'content.cluster': [cl.name] })}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] text-white truncate flex-1">{cl.name}</span>
                                        <span className="text-[10px] text-[#888] font-mono tabular-nums shrink-0">{cl.count}</span>
                                    </div>
                                    <RsBar
                                        label={`Avg quality ${Math.round(cl.avgQuality)}`}
                                        value={Math.round(cl.avgQuality)}
                                        total={100}
                                        tone={cl.avgQuality >= 70 ? 'good' : cl.avgQuality >= 50 ? 'warn' : 'bad'}
                                        suffix="%"
                                    />
                                    {(cl.thin > 0 || cl.stale > 0) && (
                                        <div className="mt-1 flex gap-3 text-[10px] text-[#666]">
                                            {cl.thin > 0 && <span>· {cl.thin} thin</span>}
                                            {cl.stale > 0 && <span>· {cl.stale} stale</span>}
                                            {cl.clicks > 0 && <span className="ml-auto">{cl.clicks.toLocaleString()} clicks</span>}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Section>
            )}

            {intentRows.length > 0 && (
                <Section title="Search intent mix">
                    <Card padded>
                        {intentRows.map(r => (
                            <div key={r.label} className="mb-2 last:mb-0">
                                <RsBar label={r.label} value={r.count} total={c.total} suffix={`· ${r.value}%`} />
                            </div>
                        ))}
                    </Card>
                </Section>
            )}

            <Section title="Coverage signals">
                <Card padded>
                    <RsRow label="Pages with cluster" value={fmtPct(c.total - c.clusterRows.find(x => x.name === 'uncategorised')?.count!, c.total, 0)} />
                    <RsRow label="Avg pages / cluster" value={fmtNum(c.clusterRows.length ? c.total / c.clusterRows.length : 0, { maximumFractionDigits: 1 })} />
                </Card>
            </Section>
        </div>
    )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
