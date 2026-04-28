import * as React from 'react'
import { SectionTitle, Card, Row, Bar } from '../../shared/primitives'
import { StackedBar } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

export function IndexingTab({ stats }: RsTabProps<TechnicalStats>) {
	const parts = [
		{ label: 'Indexed', value: stats.indexability.indexed, color: '#22c55e' },
		{ label: 'Blocked', value: stats.indexability.blocked, color: '#ef4444' },
		{ label: 'Noindex', value: stats.indexability.noindex, color: '#f59e0b' },
		{ label: 'Canon.', value: stats.indexability.canonicalized, color: '#3b82f6' },
	]

	return (
		<div className="space-y-4">
			<SectionTitle>Indexability status</SectionTitle>
			<Card>
				<StackedBar parts={parts} />
			</Card>

			<SectionTitle>Sitemap coverage</SectionTitle>
			<Card>
				<Row label="Urls in sitemap" value={fmtInt(stats.indexability.indexed)} />
				<div className="mt-2">
					<Bar value={85} tone="good" />
				</div>
				<div className="mt-2 text-[10px] text-neutral-500">
					Sitemap: sitemap.xml · Last parsed 2h ago
				</div>
			</Card>

			<SectionTitle>Robots.txt</SectionTitle>
			<Card>
				<div className="text-[10px] text-neutral-400 font-mono bg-neutral-950 p-2 rounded border border-neutral-900">
					User-agent: *<br/>
					Allow: /<br/>
					Disallow: /admin/<br/>
					Sitemap: https://example.com/sitemap.xml
				</div>
			</Card>
		</div>
	)
}
