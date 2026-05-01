import React from 'react'
import { useContentInsights } from '../_hooks/useContentInsights'
import { Section, Card, EmptyState, fmtNum } from '../_shared'
import { RsActionRow } from '../parts/RsActionRow'

export function ContentActions() {
    const c = useContentInsights()
    if (c.total === 0) return <EmptyState title="No actions yet" hint="Actions appear after the crawl finishes." />
    if (c.topActions.length === 0) {
        return <EmptyState title="No content actions queued" hint="Everything looks clean for now." />
    }

    return (
        <div className="space-y-3">
            <Section title={`Top actions (${fmtNum(c.topActions.length)})`}>
                <div className="space-y-2">
                    {c.topActions.map(a => (
                        <RsActionRow
                            key={a.title}
                            title={a.title}
                            count={a.count}
                            priority={a.priority}
                            forecast={a.forecast}
                        />
                    ))}
                </div>
            </Section>

            <Section title="Quick wins">
                <Card padded>
                    <ul className="space-y-1.5 text-[11px] text-[#ddd]">
                        {c.thin > 0 &&        <li>· Expand or merge <b>{c.thin}</b> thin pages</li>}
                        {c.exactDupes > 0 &&  <li>· Resolve <b>{c.exactDupes}</b> exact duplicates with canonicals</li>}
                        {c.cannibal > 0 &&    <li>· Disambiguate <b>{c.cannibal}</b> cannibalising pairs</li>}
                        {c.stale > 0 &&       <li>· Republish <b>{c.stale}</b> stale articles</li>}
                        {c.eeat.bios < 50 && <li>· Add author bios — currently {Math.round(c.eeat.bios)}%</li>}
                        {c.schemaCoverage.any < 60 && <li>· Add schema — currently {Math.round(c.schemaCoverage.any)}% coverage</li>}
                    </ul>
                </Card>
            </Section>
        </div>
    )
}
