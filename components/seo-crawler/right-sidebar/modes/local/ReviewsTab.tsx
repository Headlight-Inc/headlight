import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function ReviewsTab({ stats }: RsTabProps<LocalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Reviews</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Total" value={fmtInt(stats.reviews.total)} />
					<StatTile label="Avg rating" value={stats.reviews.avgRating.toFixed(2)} tone={stats.reviews.avgRating >= 4.3 ? 'good' : 'warn'} />
					<StatTile label="Last 30d" value={fmtInt(stats.reviews.last30)} />
					<StatTile label="Response rate" value={fmtPct(stats.reviews.responseRate)} tone={stats.reviews.responseRate >= 0.8 ? 'good' : 'warn'} />
					<StatTile label="Neg unanswered" value={fmtInt(stats.reviews.negativeUnanswered)} tone={stats.reviews.negativeUnanswered ? 'bad' : 'good'} />
				</div>
			</Card>
		</div>
	)
}
