import * as React from 'react'
import { SectionTitle, Card, Row, Bar, StatTile } from '../../shared/primitives'
import { MiniBar } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

export function PerformanceTab({ stats }: RsTabProps<TechnicalStats>) {
	const speedData = [
		{ name: 'Good', value: stats.performance.good, tone: '#22c55e' },
		{ name: 'Needs Impr', value: stats.performance.needsImpr, tone: '#f59e0b' },
		{ name: 'Poor', value: stats.performance.poor, tone: '#ef4444' },
	]

	return (
		<div className="space-y-4">
			<SectionTitle>Vitals distribution</SectionTitle>
			<Card>
				<MiniBar data={speedData} />
			</Card>

			<SectionTitle>Average core vitals</SectionTitle>
			<div className="px-3 grid grid-cols-1 gap-1.5">
				<div className="flex items-center justify-between p-2 bg-neutral-900/50 rounded border border-neutral-900">
					<div>
						<div className="text-[9px] text-neutral-500 uppercase tracking-widest">LCP (Largest Contentful Paint)</div>
						<div className="text-[18px] font-black text-white">{stats.performance.avgLcp}s</div>
					</div>
					<div className="text-[10px] text-green-400 font-bold">GOOD</div>
				</div>
				<div className="flex items-center justify-between p-2 bg-neutral-900/50 rounded border border-neutral-900">
					<div>
						<div className="text-[9px] text-neutral-500 uppercase tracking-widest">FID (First Input Delay)</div>
						<div className="text-[18px] font-black text-white">{stats.performance.avgFid}ms</div>
					</div>
					<div className="text-[10px] text-green-400 font-bold">GOOD</div>
				</div>
				<div className="flex items-center justify-between p-2 bg-neutral-900/50 rounded border border-neutral-900">
					<div>
						<div className="text-[9px] text-neutral-500 uppercase tracking-widest">CLS (Cumulative Layout Shift)</div>
						<div className="text-[18px] font-black text-white">{stats.performance.avgCls}</div>
					</div>
					<div className="text-[10px] text-orange-400 font-bold">NEEDS IMPR</div>
				</div>
			</div>

			<SectionTitle>Asset health</SectionTitle>
			<Card>
				<Row label="Unminified JS" value="12" tone="warn" />
				<Row label="Unoptimized images" value="45" tone="bad" />
				<Row label="Render blocking CSS" value="3" tone="accent" />
			</Card>
		</div>
	)
}
