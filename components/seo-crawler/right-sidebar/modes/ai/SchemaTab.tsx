import * as React from 'react'
import { Card, SectionTitle, Row, Bar } from '../../shared/primitives'
import { fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

function SchemaRow({ label, value }: { label: string; value: number }) {
	const tone = value >= 0.7 ? 'good' : value >= 0.3 ? 'warn' : 'bad'
	return (
		<div className="py-1">
			<Row label={label} value={fmtPct(value)} />
			<Bar value={value * 100} tone={tone as any} />
		</div>
	)
}

export function SchemaTab({ stats }: RsTabProps<AiStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Structured data</SectionTitle>
			<Card>
				<SchemaRow label="Schema coverage" value={stats.schemaCoverage} />
				<SchemaRow label="JSON-LD" value={stats.jsonLdRate} />
				<SchemaRow label="FAQPage" value={stats.faqSchemaRate} />
				<SchemaRow label="HowTo" value={stats.howToSchemaRate} />
			</Card>
		</div>
	)
}
