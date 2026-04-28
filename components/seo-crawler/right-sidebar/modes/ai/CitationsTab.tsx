import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function CitationsTab({ stats }: RsTabProps<AiStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>By engine</SectionTitle>
			<Card>
				{stats.citationsByEngine.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No citations tracked yet</div>
				) : stats.citationsByEngine.map(e => (
					<Row key={e.engine} label={e.engine} value={fmtInt(e.count)} />
				))}
			</Card>

			<SectionTitle>Top cited pages</SectionTitle>
			<Card>
				{stats.topCitedPages.length === 0 ? (
					<div className="text-[11px] italic text-neutral-500">No data</div>
				) : stats.topCitedPages.map((c, i) => (
					<Row
						key={`${c.url}-${c.engine}-${i}`}
						label={<span className="truncate max-w-[180px] inline-block align-bottom" title={c.url}>{new URL(c.url).pathname}</span>}
						value={`${c.engine} · ${fmtInt(c.count)}`}
					/>
				))}
			</Card>
		</div>
	)
}
