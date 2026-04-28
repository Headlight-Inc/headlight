import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/full-audit'

export function ActionsTab({ stats }: RsTabProps<FullAuditStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Recommended Actions</SectionTitle>
			<div className="space-y-2">
				<Card className="p-3">
					<Row label="Fix 4 broken links" value="High Impact" tone="bad" />
				</Card>
				<Card className="p-3">
					<Row label="Add missing meta descriptions" value="Med Impact" tone="warn" />
				</Card>
				<Card className="p-3">
					<Row label="Optimize image alt text" value="Low Impact" />
				</Card>
			</div>
		</div>
	)
}
