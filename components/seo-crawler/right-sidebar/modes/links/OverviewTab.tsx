import * as React from 'react'
import { Card, SectionTitle, Row, StatTile, Gauge } from '../../shared/primitives'
import { MiniRadar } from '../../shared/charts'
import { fmtInt, fmtPct, scoreTone } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LinksStats } from '@/services/right-sidebar/links'

export function OverviewTab({ stats }: RsTabProps<LinksStats>) {
	return (
		<div className="space-y-4">
			<Card className="p-4 flex items-center justify-between">
				<div>
					<div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Link Equity</div>
					<div className="mt-1 text-3xl font-black text-white">{stats.overallScore}</div>
				</div>
				<div className="h-16 w-16">
					<Gauge value={stats.overallScore} tone={scoreTone(stats.overallScore)} />
				</div>
			</Card>

			<SectionTitle>Link profile</SectionTitle>
			<div className="grid grid-cols-2 gap-2">
				<StatTile label="Internal Links" value={fmtInt(stats.internalCount)} />
				<StatTile label="External Links" value={fmtInt(stats.externalCount)} />
				<StatTile label="Authority Score" value={String(stats.authorityScore)} tone="good" />
				<StatTile label="Broken" value={fmtInt(stats.brokenCount)} tone={stats.brokenCount > 0 ? 'bad' : 'good'} />
			</div>
		</div>
	)
}
