import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

export function InventoryTab({ stats }: RsTabProps<CommerceStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Stock health</SectionTitle>
			<Card>
				<Row label="Out of stock" value={<span className="flex items-center gap-2"><Chip tone={stats.oosRate < 0.05 ? 'good' : 'warn'}>{fmtPct(stats.oosRate)}</Chip>{fmtInt(stats.oosCount)}</span>} />
				<Row label="Discontinued" value={fmtInt(stats.discontinuedCount)} />
			</Card>
		</div>
	)
}
