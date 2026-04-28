import * as React from 'react'
import { SectionTitle, Card, Row, Bar, StatTile } from '../../shared/primitives'
import { MiniDonut } from '../../shared/charts'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { TechnicalStats } from '@/services/right-sidebar/technical'

export function SecurityTab({ stats }: RsTabProps<TechnicalStats>) {
	const securityParts = [
		{ name: 'HTTPS', value: stats.security.https, color: '#22c55e' },
		{ name: 'HTTP', value: stats.security.http, color: '#ef4444' },
	]

	return (
		<div className="space-y-4">
			<SectionTitle>Protocol distribution</SectionTitle>
			<Card>
				<div className="flex items-center gap-4">
					<MiniDonut data={securityParts} />
					<div className="flex-1 space-y-1">
						<div className="flex items-center justify-between">
							<span className="text-[10px] text-neutral-400">HTTPS</span>
							<span className="text-[10px] text-white font-mono">{fmtInt(stats.security.https)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[10px] text-neutral-400">HTTP</span>
							<span className="text-[10px] text-red-400 font-mono">{fmtInt(stats.security.http)}</span>
						</div>
					</div>
				</div>
			</Card>

			<SectionTitle>Security headers</SectionTitle>
			<Card>
				<Row label="HSTS enabled" value={stats.security.hsts ? 'YES' : 'NO'} tone={stats.security.hsts ? 'good' : 'warn'} />
				<Row label="X-Content-Type" value="YES" tone="good" />
				<Row label="X-Frame-Options" value="NO" tone="bad" />
				<Row label="Content-Security-Policy" value="NO" tone="bad" />
			</Card>

			<SectionTitle>SSL / Certificate</SectionTitle>
			<Card>
				<Row label="Issuer" value="Let's Encrypt" />
				<Row label="Expiry" value="82 days" tone="good" />
				<Row label="Protocol" value="TLS 1.3" tone="good" />
			</Card>
		</div>
	)
}
