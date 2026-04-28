import * as React from 'react'
import { Card, SectionTitle, StatTile, Gauge } from '../../shared/primitives'
import { Sparkline } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { SocialStats } from '@/services/right-sidebar/social'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function OverviewTab({ stats }: RsTabProps<SocialStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Share of voice</SectionTitle>
			<Card><Gauge value={stats.shareOfVoice * 100} label="vs tracked competitors" /></Card>

			<SectionTitle>Mentions (30d)</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Total" value={fmtInt(stats.mentions30d)} />
					<StatTile label="Engagement" value={fmtPct(stats.avgEngagementRate)} />
				</div>
				<div className="mt-2"><Sparkline data={stats.mentionsTrend} /></div>
			</Card>
		</div>
	)
}
