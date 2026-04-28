import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function GbpTab({ stats }: RsTabProps<LocalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Profiles</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Verified" value={fmtInt(stats.gbp.verified)} tone="good" />
					<StatTile label="Suspended" value={fmtInt(stats.gbp.suspended)} tone={stats.gbp.suspended ? 'bad' : 'good'} />
					<StatTile label="Avg photos" value={fmtInt(stats.gbp.photosAvg)} />
					<StatTile label="Posts (30d)" value={fmtInt(stats.gbp.postsLast30d)} />
					<StatTile label="Q&A unanswered" value={fmtInt(stats.gbp.qaUnanswered)} tone={stats.gbp.qaUnanswered ? 'warn' : 'good'} />
				</div>
			</Card>
		</div>
	)
}
