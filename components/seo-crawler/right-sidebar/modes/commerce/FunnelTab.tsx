import * as React from 'react'
import { Card, SectionTitle, Row, StatTile } from '../../shared/primitives'
import { fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function FunnelTab({ stats }: RsTabProps<CommerceStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Conversion</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Add to cart" value={fmtPct(stats.addToCartRate)} />
					<StatTile label="Checkout" value={fmtPct(stats.checkoutStartRate)} />
					<StatTile label="Purchase" value={fmtPct(stats.purchaseRate)} tone={stats.purchaseRate >= 0.02 ? 'good' : 'warn'} />
					<StatTile label="Cart abandon" value={fmtPct(stats.cartAbandonment)} tone={stats.cartAbandonment < 0.6 ? 'good' : 'bad'} />
				</div>
			</Card>
		</div>
	)
}
