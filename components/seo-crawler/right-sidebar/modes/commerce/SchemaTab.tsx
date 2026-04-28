import * as React from 'react'
import { Card, SectionTitle, Row, Bar } from '../../shared/primitives'
import { fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { CommerceStats } from '@/services/right-sidebar/commerce'

function SchemaRow({ label, value }: { label: string; value: number }) {
	const tone = value >= 0.9 ? 'good' : value >= 0.5 ? 'warn' : 'bad'
	return (
		<div className="py-1">
			<Row label={label} value={fmtPct(value)} />
			<Bar value={value * 100} tone={tone as any} />
		</div>
	)
}

export function SchemaTab({ stats }: RsTabProps<CommerceStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Schema coverage</SectionTitle>
			<Card>
				<SchemaRow label="Product" value={stats.productSchemaCoverage} />
				<SchemaRow label="Offer" value={stats.offersSchemaCoverage} />
				<SchemaRow label="AggregateRating" value={stats.reviewSchemaCoverage} />
				<SchemaRow label="BreadcrumbList" value={stats.breadcrumbCoverage} />
			</Card>
		</div>
	)
}
