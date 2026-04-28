import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CompetitorsStats } from '@/services/right-sidebar/competitors'

export function BacklinkOverlapTab({ stats }: RsTabProps<CompetitorsStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Shared link partners</SectionTitle>
			<Card>
				{stats.backlinkOverlap.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No overlap data</div>
				) : stats.backlinkOverlap.map(b => (
					<Row
						key={b.domain}
						label={b.domain}
						value={`${fmtInt(b.sharedDomains)} shared · ${fmtInt(b.uniqueToCompetitor)} theirs`}
					/>
				))}
			</Card>

			<SectionTitle>Top opportunity domains</SectionTitle>
			<Card>
				{stats.topOpportunityDomains.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No opportunities</div>
				) : stats.topOpportunityDomains.map(o => (
					<Row key={o.domain} label={o.domain} value={fmtInt(o.potential)} />
				))}
			</Card>
		</div>
	)
}
