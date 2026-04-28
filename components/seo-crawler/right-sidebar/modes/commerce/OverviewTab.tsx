import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function OverviewTab({ stats }: RsTabProps<CommerceStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Catalog</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Products" value={fmtInt(stats.productPages)} />
					<StatTile label="Categories" value={fmtInt(stats.categoryPages)} />
					<StatTile label="OOS" value={fmtInt(stats.oosCount)} sub={fmtPct(stats.oosRate)} tone={stats.oosRate < 0.05 ? 'good' : 'warn'} />
					<StatTile label="Avg price" value={`${stats.currency} ${stats.avgPrice.toFixed(2)}`} />
				</div>
			</Card>

			<SectionTitle>30-day revenue</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Revenue" value={`${stats.currency} ${fmtInt(stats.revenue30d)}`} />
					<StatTile label="Orders" value={fmtInt(stats.orders30d)} />
					<StatTile label="AOV" value={`${stats.currency} ${stats.aovAvg.toFixed(2)}`} />
				</div>
			</Card>
		</div>
	)
}
