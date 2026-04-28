import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { LocalStats } from '@/services/right-sidebar/local'

export function NapTab({ stats }: RsTabProps<LocalStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Mismatches by field</SectionTitle>
			<Card>
				{stats.napMismatches.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">All tracked sources match</div>
				) : stats.napMismatches.map(m => (
					<Row
						key={m.field}
						label={<span className="flex items-center gap-2"><Chip tone="warn">{m.field}</Chip>{m.sources.join(', ')}</span>}
						value={fmtInt(m.count)}
					/>
				))}
			</Card>
		</div>
	)
}
