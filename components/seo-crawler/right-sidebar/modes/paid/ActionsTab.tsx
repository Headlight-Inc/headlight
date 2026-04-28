import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

export function ActionsTab({ stats }: RsTabProps<PaidStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Top paid actions</SectionTitle>
			<Card>
				{stats.topActions.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No paid actions queued</div>
				) : stats.topActions.map(a => (
					<Row
						key={a.id}
						label={<span className="flex items-center gap-2"><Chip tone={a.effort === 'low' ? 'good' : a.effort === 'high' ? 'bad' : 'warn'}>{a.effort}</Chip>{a.label}</span>}
						value={fmtInt(a.impact)}
					/>
				))}
			</Card>
		</div>
	)
}
