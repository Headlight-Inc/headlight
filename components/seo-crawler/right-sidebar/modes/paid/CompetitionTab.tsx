import * as React from 'react'
import { Card, SectionTitle, Row, StatTile } from '../../shared/primitives'
import { fmtPct, fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function CompetitionTab({ stats }: RsTabProps<PaidStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Impression share</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="IS%" value={fmtPct(stats.impressionShare)} tone={stats.impressionShare >= 0.5 ? 'good' : 'warn'} />
					<StatTile label="Lost - rank" value={fmtPct(stats.impressionShareLost.rank)} tone="bad" />
					<StatTile label="Lost - budget" value={fmtPct(stats.impressionShareLost.budget)} tone="warn" />
				</div>
			</Card>

			<SectionTitle>Top paid competitors</SectionTitle>
			<Card>
				{stats.topCompetitors.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No competitor overlap data</div>
				) : stats.topCompetitors.map(c => (
					<Row key={c.domain} label={c.domain} value={fmtInt(c.overlap)} />
				))}
			</Card>
		</div>
	)
}
