import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorsStats } from '@/services/right-sidebar/competitors'

export function GapsTab({ stats }: RsTabProps<CompetitorsStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Top keyword gaps</SectionTitle>
			<Card>
				{stats.gapKeywords.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No gap data</div>
				) : stats.gapKeywords.map(k => (
					<Row
						key={k.keyword}
						label={k.keyword}
						value={`${fmtInt(k.volume)} vol · #${k.competitorRank}${k.ourRank ? ` / #${k.ourRank}` : ''}`}
					/>
				))}
			</Card>
		</div>
	)
}
