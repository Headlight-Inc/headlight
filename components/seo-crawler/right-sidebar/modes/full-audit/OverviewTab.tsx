import * as React from 'react'
import { Card, SectionTitle, Row, StatTile, Gauge } from '../../shared/primitives'
import { MiniRadar } from '../../shared/charts'
import { fmtInt, fmtPct, scoreTone } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/full-audit'

export function OverviewTab({ stats }: RsTabProps<FullAuditStats>) {
	return (
		<div className="space-y-4">
			<Card className="p-4 flex items-center justify-between">
				<div>
					<div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Overall Health</div>
					<div className="mt-1 text-3xl font-black text-white">{stats.overallScore}</div>
				</div>
				<div className="h-16 w-16">
					<Gauge value={stats.overallScore} tone={scoreTone(stats.overallScore)} />
				</div>
			</Card>

			<SectionTitle>Site breakdown</SectionTitle>
			<Card className="p-4">
				<div className="h-48">
					<MiniRadar data={stats.radar} />
				</div>
			</Card>

			<div className="grid grid-cols-2 gap-2">
				<StatTile label="Total Pages" value={fmtInt(stats.totalPages)} />
				<StatTile label="Indexable" value={fmtInt(stats.indexableCount)} />
				<StatTile label="Health" value={fmtPct(stats.healthPct)} tone={scoreTone(stats.healthPct * 100)} />
				<StatTile label="Errors" value={fmtInt(stats.errorCount)} tone={stats.errorCount > 0 ? 'bad' : 'good'} />
			</div>
		</div>
	)
}
