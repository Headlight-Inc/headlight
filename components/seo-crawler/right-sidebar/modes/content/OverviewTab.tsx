import * as React from 'react'
import { SectionTitle, Card, Gauge, StatTile, Row, Bar } from '../../shared/primitives'
import { MiniRadar, MiniBar } from '../../shared/charts'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { ContentStats } from '@/services/right-sidebar/content'

export function OverviewTab({ stats }: RsTabProps<ContentStats>) {
	const qualityData = [
		{ name: 'High', value: stats.quality.high, tone: '#22c55e' },
		{ name: 'Med', value: stats.quality.medium, tone: '#3b82f6' },
		{ name: 'Low', value: stats.quality.low, tone: '#ef4444' },
	]

	return (
		<div className="space-y-4">
			<SectionTitle>Content Quality</SectionTitle>
			<Card>
				<div className="flex items-center gap-4">
					<Gauge value={stats.overallScore} size={80} />
					<div className="flex-1">
						<div className="text-[11px] text-neutral-400">Content analysis covers semantics, intent, and readability.</div>
					</div>
				</div>
				<div className="mt-4">
					<MiniRadar data={stats.radar} />
				</div>
			</Card>

			<SectionTitle>Quality mix</SectionTitle>
			<Card>
				<MiniBar data={qualityData} />
			</Card>

			<SectionTitle>Top Keywords</SectionTitle>
			<Card>
				{stats.keywords.top.map((k) => (
					<Row key={k.label} label={k.label} value={fmtInt(k.value)} />
				))}
			</Card>
		</div>
	)
}
