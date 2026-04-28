import * as React from 'react'
import { Card, SectionTitle, StatTile, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { SocialStats } from '@/services/right-sidebar/social'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function TrafficTab({ stats }: RsTabProps<SocialStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Social traffic (30d)</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Sessions" value={fmtInt(stats.socialSessions30d)} />
					<StatTile label="Conversions" value={fmtInt(stats.socialConversions30d)} />
				</div>
			</Card>

			<SectionTitle>Top referrers</SectionTitle>
			<Card>
				{stats.socialReferrers.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No social referrers</div>
				) : stats.socialReferrers.map(r => (
					<Row key={r.host} label={r.host} value={fmtInt(r.sessions)} />
				))}
			</Card>
		</div>
	)
}
