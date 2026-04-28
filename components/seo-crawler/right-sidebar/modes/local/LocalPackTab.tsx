import * as React from 'react'
import { Card, SectionTitle, StatTile, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }

export function LocalPackTab({ stats }: RsTabProps<LocalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Local pack</SectionTitle>
			<Card>
				<div style={gridStyle}>
					<StatTile label="Appearances" value={fmtInt(stats.localPack.appearances)} />
					<StatTile label="Avg rank" value={stats.localPack.avgRank.toFixed(1)} tone={stats.localPack.avgRank <= 3 ? 'good' : 'warn'} />
				</div>
			</Card>

			<SectionTitle>Top keywords</SectionTitle>
			<Card>
				{stats.localPack.topKeywords.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No local pack data</div>
				) : stats.localPack.topKeywords.map(k => (
					<Row key={k.keyword} label={k.keyword} value={`#${k.rank} · ${fmtInt(k.volume)}`} />
				))}
			</Card>
		</div>
	)
}
