import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import { StackedBar } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { SocialStats } from '@/services/right-sidebar/social'

export function MentionsTab({ stats }: RsTabProps<SocialStats>) {
	const parts = [
		{ value: stats.sentiment.positive, color: '#34d399', label: 'Pos' },
		{ value: stats.sentiment.neutral, color: '#a3a3a3', label: 'Neu' },
		{ value: stats.sentiment.negative, color: '#fb7185', label: 'Neg' },
	]
	return (
		<div className="space-y-4">
			<SectionTitle>Sentiment</SectionTitle>
			<Card><StackedBar parts={parts} /></Card>

			<SectionTitle>Top channels</SectionTitle>
			<Card>
				{stats.topChannels.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No mention data</div>
				) : stats.topChannels.map(c => (
					<Row key={c.channel} label={c.channel} value={`${fmtInt(c.mentions)} · ${fmtPct(c.engagementRate)}`} />
				))}
			</Card>
		</div>
	)
}
