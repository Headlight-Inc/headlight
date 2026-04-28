import * as React from 'react'
import { Card, SectionTitle, Gauge, Row, Chip } from '../../shared/primitives'
import { fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

export function OverviewTab({ stats }: RsTabProps<AiStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>AI readiness</SectionTitle>
			<Card><Gauge value={stats.aiReadinessScore} label="Composite score" /></Card>

			<SectionTitle>Signals</SectionTitle>
			<Card>
				<Row label="llms.txt" value={<Chip tone={stats.llmTxtPresent ? 'good' : 'warn'}>{stats.llmTxtPresent ? 'present' : 'missing'}</Chip>} />
				<Row label="Clean markup" value={fmtPct(stats.cleanMarkupRate)} />
				<Row label="Schema coverage" value={fmtPct(stats.schemaCoverage)} />
			</Card>
		</div>
	)
}
