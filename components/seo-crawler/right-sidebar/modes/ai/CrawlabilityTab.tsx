import * as React from 'react'
import { Card, SectionTitle, Row, Chip } from '../../shared/primitives'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { AiStats } from '@/services/right-sidebar/ai'

function BotRow({ label, on }: { label: string; on: boolean }) {
	return <Row label={label} value={<Chip tone={on ? 'good' : 'bad'}>{on ? 'allowed' : 'blocked'}</Chip>} />
}

export function CrawlabilityTab({ stats }: RsTabProps<AiStats>) {
	return (
		<div className="space-y-4">
			<SectionTitle>LLM crawlers</SectionTitle>
			<Card>
				<BotRow label="GPTBot" on={stats.llmAllowed.gptbot} />
				<BotRow label="ClaudeBot" on={stats.llmAllowed.claudebot} />
				<BotRow label="Google-Extended" on={stats.llmAllowed.google_extended} />
				<BotRow label="PerplexityBot" on={stats.llmAllowed.perplexitybot} />
				<BotRow label="CCBot" on={stats.llmAllowed.ccbot} />
			</Card>
		</div>
	)
}
