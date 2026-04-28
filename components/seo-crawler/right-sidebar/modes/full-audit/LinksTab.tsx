import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/full-audit'

export function LinksTab({ stats }: RsTabProps<FullAuditStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Link Authority</SectionTitle>
			<div className="grid grid-cols-2 gap-2">
				<StatTile label="Internal Links" value="1.2k" />
				<StatTile label="Broken Links" value="4" tone="bad" />
			</div>
			<Card className="p-3 text-[11px] text-neutral-400">
				Detailed link metrics available in Links & Authority mode.
			</Card>
		</div>
	)
}
