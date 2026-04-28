import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/full-audit'

export function TechTab({ stats }: RsTabProps<FullAuditStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Technical Health</SectionTitle>
			<div className="grid grid-cols-2 gap-2">
				<StatTile label="Crawlable" value={fmtInt(stats.totalPages)} />
				<StatTile label="HTTPS" value="100%" tone="good" />
			</div>
			<Card className="p-3 text-[11px] text-neutral-400">
				Detailed technical metrics available in Technical mode.
			</Card>
		</div>
	)
}
