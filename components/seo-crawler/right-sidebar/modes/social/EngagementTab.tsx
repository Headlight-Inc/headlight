import * as React from 'react'
import { Card, SectionTitle, Row } from '../../shared/primitives'
import { fmtInt } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { SocialStats } from '@/services/right-sidebar/social'

export function EngagementTab({ stats }: RsTabProps<SocialStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>Followers</SectionTitle>
			<Card>
				<Row label="Facebook" value={fmtInt(stats.followers.facebook)} />
				<Row label="Instagram" value={fmtInt(stats.followers.instagram)} />
				<Row label="TikTok" value={fmtInt(stats.followers.tiktok)} />
				<Row label="X" value={fmtInt(stats.followers.x)} />
				<Row label="YouTube" value={fmtInt(stats.followers.youtube)} />
				<Row label="LinkedIn" value={fmtInt(stats.followers.linkedin)} />
			</Card>
		</div>
	)
}
