import * as React from 'react'
import { Card, SectionTitle, Gauge, StatTile } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function OverviewTab({ stats }: RsTabProps<LocalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>NAP consistency</SectionTitle>
			<Card><Gauge value={stats.napConsistency} label="Across tracked sources" /></Card>

			<SectionTitle>Footprint</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Locations" value={fmtInt(stats.locations)} />
					<StatTile label="GBP profiles" value={fmtInt(stats.gbp.profiles)} />
					<StatTile label="LocalBusiness schema" value={fmtPct(stats.localBusinessSchemaRate)} tone={stats.localBusinessSchemaRate >= 0.8 ? 'good' : 'warn'} />
					<StatTile label="Avg rating" value={stats.reviews.avgRating.toFixed(2)} tone={stats.reviews.avgRating >= 4.3 ? 'good' : 'warn'} />
				</div>
			</Card>
		</div>
	)
}
