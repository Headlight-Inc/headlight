import React from 'react'
import { Card } from '../Card'
import { Section } from '../Section'
import { KpiRow, KpiTile } from '../kpi'
import { fmtPct } from '../format'
import { scoreToTone } from '../scoring'

export function ImpactForecastCard({
	title = 'If all top fixes ship',
	deltaScore, deltaClicks, horizonDays = 90, confidence,
}: {
	title?: string
	deltaScore: number
	deltaClicks: number
	horizonDays?: number
	confidence: number
}) {
	return (
		<Card>
			<Section title={title} dense>
				<KpiRow>
					<KpiTile label="Δ score" value={`+${Math.round(deltaScore)}`} tone="good" />
					<KpiTile label="Δ clicks/mo" value={deltaClicks > 0 ? `+${Math.round(deltaClicks).toLocaleString()}` : '—'} tone="good" />
					<KpiTile label="Horizon" value={`${horizonDays}d`} />
					<KpiTile label="Confidence" value={fmtPct(confidence * 100)} tone={scoreToTone(confidence * 100)} />
				</KpiRow>
			</Section>
		</Card>
	)
}
