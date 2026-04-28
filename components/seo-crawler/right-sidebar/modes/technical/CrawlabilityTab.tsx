import * as React from 'react'
import { SectionTitle, Card, Row, Bar, StatTile } from '../../shared/primitives'
import { MiniBar } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

export function CrawlabilityTab({ stats }: RsTabProps<TechnicalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Crawl depth distribution</SectionTitle>
			<Card>
				<MiniBar data={stats.crawlability.depthDistribution} />
			</Card>

			<SectionTitle>Internal link health</SectionTitle>
			<div className="px-3 grid grid-cols-2 gap-1.5">
				<StatTile label="Avg Depth" value={stats.crawlability.avgDepth.toFixed(1)} tone={stats.crawlability.avgDepth > 5 ? 'warn' : 'good'} />
				<StatTile label="Internal Links" value={fmtInt(stats.crawlability.internalLinks)} />
				<StatTile label="Broken Links" value={fmtInt(stats.crawlability.brokenLinks)} tone={stats.crawlability.brokenLinks > 0 ? 'bad' : 'good'} />
				<StatTile label="Orphan Pages" value="12" tone="warn" />
			</div>

			<SectionTitle>Redirect chains</SectionTitle>
			<Card>
				<Row label="Total redirects" value="156" />
				<Row label="301 Permanent" value="142" />
				<Row label="302 Temporary" value="14" tone="warn" />
				<Row label="Redirect chains" value="4" tone="bad" />
			</Card>
		</div>
	)
}
