import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function FeedTab({ stats }: RsTabProps<CommerceStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Merchant feed</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Items" value={fmtInt(stats.feedItems)} />
					<StatTile label="Errors" value={fmtInt(stats.feedErrors)} tone={stats.feedErrors ? 'bad' : 'good'} />
					<StatTile label="Warnings" value={fmtInt(stats.feedWarnings)} tone={stats.feedWarnings ? 'warn' : 'good'} />
				</div>
			</Card>
		</div>
	)
}
