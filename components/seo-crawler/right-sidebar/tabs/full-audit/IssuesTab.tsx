import React from 'react'
import { useSeoCrawler } from '../../../../../contexts/SeoCrawlerContext'
import { Card } from '../../primitives/Card'
import { KpiTile } from '../../primitives/KpiTile'
import { Bars } from '../../primitives/Bars'
import { useFullAuditRsData } from '../../selectors/useFullAuditRsData'

export default function IssuesTab() {
    const d = useFullAuditRsData()
    const { setActiveMacro } = useSeoCrawler()

    const total = d.issues.critical + d.issues.high + d.issues.medium + d.issues.low + d.issues.notice
    return (
        <div className="px-2.5 pt-2.5 pb-6">
            <Card title="Severity">
                <div className="grid grid-cols-2 gap-2">
                    <KpiTile label="Critical" value={d.issues.critical} accent="bad" />
                    <KpiTile label="High"     value={d.issues.high}     accent="warn" />
                    <KpiTile label="Medium"   value={d.issues.medium}   accent="info" />
                    <KpiTile label="Low"      value={d.issues.low}      accent={null} />
                </div>
                <div className="text-[10px] text-[#666] mt-2">Total {total.toLocaleString()} · Notices {d.issues.notice.toLocaleString()}</div>
            </Card>

            <Card title="By category">
                {d.issues.byCategory.length === 0
                    ? <div className="text-[11px] text-[#666]">No categorised issues yet.</div>
                    : <Bars items={d.issues.byCategory.map(b => ({ label: b.label, value: b.value, tone: 'info' }))} />}
            </Card>

            <Card title="Top issues" action={<button className="text-[#888] hover:text-white" onClick={() => setActiveMacro?.('all')}>All</button>}>
                {d.issues.topIssues.length === 0
                    ? <div className="text-[11px] text-[#666]">No issues triggered.</div>
                    : (
                        <ul className="space-y-1">
                            {d.issues.topIssues.map(i => (
                                <li
                                    key={i.label}
                                    className="flex items-center justify-between text-[11px] px-1.5 py-1 rounded hover:bg-[#141414] cursor-pointer"
                                    onClick={() => setActiveMacro?.(slugify(i.label))}
                                    title="Filter the grid by this issue"
                                >
                                    <span className="truncate text-[#ddd]">{i.label}</span>
                                    <span className="tabular-nums text-[#aaa]">{i.value.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
            </Card>

            <Card title="Trend (this session)">
                <div className="grid grid-cols-2 gap-2">
                    <KpiTile label="New" value={d.issues.new} />
                    <KpiTile label="Resolved" value={d.issues.resolved} accent="good" />
                </div>
                <div className="text-[10px] text-[#666] mt-1">Numbers populate once two sessions exist.</div>
            </Card>
        </div>
    )
}

function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}
