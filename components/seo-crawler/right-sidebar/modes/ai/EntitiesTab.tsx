import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function EntitiesTab({ stats }: RsTabProps<AiStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Knowledge graph</SectionTitle>
			<Card>
				<Row label="KG coverage" value={fmtPct(stats.knowledgeGraphCoverage)} />
			</Card>

			<SectionTitle>Top entities</SectionTitle>
			<Card>
				{stats.topEntities.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No entities extracted</div>
				) : stats.topEntities.map(e => (
					<Row
						key={`${e.type}-${e.name}`}
						label={<span className="flex items-center gap-2"><Chip>{e.type}</Chip>{e.name}</span>}
						value={`${fmtInt(e.pages)} · ${e.salience.toFixed(2)}`}
					/>
				))}
			</Card>
		</div>
	)
}
