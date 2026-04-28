import * as React from 'react'
import { Card, SectionTitle, StatTile, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function SpendTab({ stats }: RsTabProps<PaidStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>30-day spend</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Spend" value={`$${fmtInt(stats.spend30d)}`} />
					<StatTile label="Clicks" value={fmtInt(stats.clicks30d)} />
					<StatTile label="Impressions" value={fmtInt(stats.impressions30d)} />
					<StatTile label="Avg CPC" value={`$${stats.cpcAvg.toFixed(2)}`} />
				</div>
			</Card>

			<SectionTitle>Campaign mix</SectionTitle>
			<Card>
				<Row label="Active campaigns" value={fmtInt(stats.activeCampaigns)} />
				<Row label="Landing pages" value={fmtInt(stats.totalLandingPages)} />
			</Card>
		</div>
	)
}
