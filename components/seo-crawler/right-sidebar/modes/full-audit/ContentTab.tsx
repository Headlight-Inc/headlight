import * as React from 'react'
import { Card, SectionTitle, StatTile } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/full-audit'

export function ContentTab({ stats }: RsTabProps<FullAuditStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Content Quality</SectionTitle>
			<div className="grid grid-cols-2 gap-2">
				<StatTile label="High Quality" value="85%" tone="good" />
				<StatTile label="Thin Pages" value="12%" tone="warn" />
			</div>
			<Card className="p-3 text-[11px] text-neutral-400">
				Detailed content metrics available in Content mode.
			</Card>
		</div>
	)
}
