import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import { Section, Card, KpiTile, EmptyState, fmtNum, fmtPct, safePathname } from '../_shared'
import { RsRow } from '../parts/RsRow'
import { RowItem } from '../_shared/RowItem'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'

export function ContentDuplication() {
    const c = useContentInsights()
    const { setActivePage } = useSeoCrawler() as any
    if (c.total === 0) return <EmptyState title="No duplication signals" hint="Run a crawl to detect duplicates." />

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <KpiTile label="Duplicate sets" value={fmtNum(c.topDupeGroups.length)} />
                <KpiTile label="Total dupes"    value={fmtNum(c.dupes)}      tone={c.dupes > 0 ? 'warn' : 'good'} />
                <KpiTile label="Exact"          value={fmtNum(c.exactDupes)} tone={c.exactDupes > 0 ? 'bad' : 'good'} />
                <KpiTile label="Near-dupes"     value={fmtNum(c.nearDupes)}  tone={c.nearDupes > 0 ? 'warn' : 'good'} />
            </div>

            <Section title="Signals">
                <Card padded>
                    <RsRow label="Cannibalising pairs" value={fmtNum(c.cannibal)} tone={c.cannibal > 0 ? 'warn' : 'good'} />
                    <RsRow label="Cross-language dupes" value={fmtNum(c.crossLangDupes)} />
                    <RsRow label="Boilerplate ratio" value={fmtPct(c.boilerplateRate, 1, 0)} tone={c.boilerplateRate > 30 ? 'warn' : 'good'} />
                </Card>
            </Section>

            {c.topDupeGroups.length > 0 && (
                <Section title="Top duplicate groups">
                    <Card padded>
                        {c.topDupeGroups.map(g => (
                            <RowItem
                                key={g.id}
                                title={`Group ${g.id.slice(0, 8)}`}
                                meta={g.sample ? safePathname(g.sample) : undefined}
                                badge={<span className="text-[10px] font-mono tabular-nums text-[#f59e0b]">{g.count}</span>}
                                onClick={() => g.sample && setActivePage?.(g.sample)}
                            />
                        ))}
                    </Card>
                </Section>
            )}
        </div>
    )
}
