import * as React from 'react'
import { Card, SectionTitle, StatTile, Gauge } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function OverviewTab({ stats }: RsTabProps<PaidStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Landing page quality</SectionTitle>
			<Card><Gauge value={stats.landingPageScoreAvg} label="Avg score" /></Card>

			<SectionTitle>Headline metrics</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Spend (30d)" value={`$${fmtInt(stats.spend30d)}`} />
					<StatTile label="ROAS" value={`${stats.roas.toFixed(2)}x`} tone={stats.roas >= 3 ? 'good' : stats.roas >= 1 ? 'warn' : 'bad'} />
					<StatTile label="CTR" value={fmtPct(stats.ctr)} />
					<StatTile label="CPA" value={`$${stats.cpaAvg.toFixed(2)}`} />
				</div>
			</Card>
		</div>
	)
}
