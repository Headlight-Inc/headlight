import * as React from 'react'
import { SectionTitle, Card, Gauge, StatTile, Row, Bar } from '../../shared/primitives'
import { MiniRadar, StackedBar } from '../../shared/charts'
import { fmtInt, scoreTone } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

export function OverviewTab({ stats }: RsTabProps<TechnicalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Technical health</SectionTitle>
			<Card>
				<div className="flex items-center gap-4">
					<Gauge value={stats.overallScore} size={80} />
					<div className="flex-1">
						<div className="text-[11px] text-neutral-400">Technical health is based on 4 key pillars.</div>
						<div className="mt-1 text-[10px] text-neutral-500 font-mono">ID: TECH-AUDIT-2024</div>
					</div>
				</div>
				<div className="mt-4">
					<MiniRadar data={stats.radar} />
				</div>
			</Card>

			<SectionTitle>Key indicators</SectionTitle>
			<div className="px-3 grid grid-cols-2 gap-1.5">
				<StatTile label="Total Pages" value={fmtInt(stats.totalPages)} />
				<StatTile label="HTML Pages" value={fmtInt(stats.htmlPages)} />
				<StatTile label="Avg Depth" value={stats.crawlability.avgDepth.toFixed(1)} />
				<StatTile label="HTTPS" value={fmtInt(stats.security.https)} tone="good" />
			</div>

			<SectionTitle>Top Issues</SectionTitle>
			<Card>
				<Row label="Broken links" value={fmtInt(stats.crawlability.brokenLinks)} tone="bad" />
				<Row label="Blocked (robots)" value={fmtInt(stats.indexability.blocked)} tone="warn" />
				<Row label="Non-HTTPS" value={fmtInt(stats.security.http)} tone="bad" />
				<Row label="Large pages (>1MB)" value="24" tone="warn" />
			</Card>
		</div>
	)
}
