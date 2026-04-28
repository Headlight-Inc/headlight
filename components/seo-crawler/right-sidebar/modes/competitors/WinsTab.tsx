import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorsStats } from '@/services/right-sidebar/competitors'

export function WinsTab({ stats }: RsTabProps<CompetitorsStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Recent wins</SectionTitle>
			<Card>
				{stats.wins.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No wins this period</div>
				) : stats.wins.map(w => (
					<Row
						key={w.keyword}
						label={w.keyword}
						value={<span className="flex items-center gap-2"><Chip tone="good">+{w.deltaPositions}</Chip>{fmtInt(w.volume)}</span>}
					/>
				))}
			</Card>
		</div>
	)
}
