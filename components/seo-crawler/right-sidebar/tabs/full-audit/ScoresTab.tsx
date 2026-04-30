import React from 'react'
import { Card } from '../../primitives/Card'
import { Gauge } from '../../primitives/Gauge'
import { Bars } from '../../primitives/Bars'
import { Distribution } from '../../primitives/Distribution'
import { KpiTile } from '../../primitives/KpiTile'
import { useFullAuditRsData } from '../../selectors/useFullAuditRsData'

export default function ScoresTab() {
    const d = useFullAuditRsData()
    const components = d.scores.components.length > 0 ? d.scores.components : []

    return (
        <div className="px-2.5 pt-2.5 pb-6">
            <Card title="Overall">
                <Gauge score={d.scores.overall} label="Site quality" />
            </Card>

            <Card title="Subscores">
                {components.length === 0
                    ? <div className="text-[11px] text-[#666]">Subscores will appear after enrichment.</div>
                    : (
                        <Bars
                            items={components.map(c => ({
                                label: c.label,
                                value: c.value,
                                tone: c.value >= 80 ? 'good' : c.value >= 60 ? 'warn' : 'bad',
                            }))}
                            maxOverride={100}
                        />
                    )}
            </Card>

            <Card title="Page distribution">
                <Distribution buckets={d.scores.distribution} />
                <div className="text-[10px] text-[#666] mt-2">Buckets are page-level Q scores 0–100.</div>
            </Card>

            <Card title="Movers">
                <div className="grid grid-cols-2 gap-2">
                    <KpiTile label="Up"   value={d.scores.movers.up}   accent="good" />
                    <KpiTile label="Down" value={d.scores.movers.down} accent="bad"  />
                </div>
            </Card>
        </div>
    )
}
