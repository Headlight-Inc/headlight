import * as React from 'react'
import { Card, SectionTitle, StatTile, Row, Chip } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorsStats } from '@/services/right-sidebar/competitors'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function OverviewTab({ stats }: RsTabProps<CompetitorsStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Visibility</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Index" value={stats.visibilityIndex.toFixed(1)} />
					<StatTile label="Δ 30d" value={`${stats.visibilityDelta30d > 0 ? '+' : ''}${stats.visibilityDelta30d.toFixed(1)}`} tone={stats.visibilityDelta30d >= 0 ? 'good' : 'bad'} />
					<StatTile label="Shared kw" value={fmtInt(stats.sharedKeywords)} />
					<StatTile label="Tracked" value={fmtInt(stats.trackedCompetitors.length)} />
				</div>
			</Card>

			<SectionTitle>Tracked competitors</SectionTitle>
			<Card>
				{stats.trackedCompetitors.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No competitors configured</div>
				) : stats.trackedCompetitors.map(c => (
					<Row
						key={c.domain}
						label={c.domain}
						value={
							<span className="flex items-center gap-2">
								<span className="text-neutral-300">{c.visibility.toFixed(1)}</span>
								<Chip tone={c.deltaPct >= 0 ? 'good' : 'bad'}>{c.deltaPct >= 0 ? '+' : ''}{fmtPct(c.deltaPct)}</Chip>
							</span>
						}
					/>
				))}
			</Card>
		</div>
	)
}
