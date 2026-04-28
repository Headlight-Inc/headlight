import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorsStats } from '@/services/right-sidebar/competitors'

export function LossesTab({ stats }: RsTabProps<CompetitorsStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Recent losses</SectionTitle>
			<Card>
				{stats.losses.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No losses this period</div>
				) : stats.losses.map(l => (
					<Row
						key={l.keyword}
						label={l.keyword}
						value={<span className="flex items-center gap-2"><Chip tone="bad">{l.deltaPositions}</Chip>{fmtInt(l.volume)}</span>}
					/>
				))}
			</Card>
		</div>
	)
}
