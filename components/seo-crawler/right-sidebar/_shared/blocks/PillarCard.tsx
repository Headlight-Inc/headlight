import React from 'react'
import { Card } from '../Card'
import { Section } from '../Section'
import { PillarRow } from './PillarRow'

export type Pillar = {
	id: string
	label: string
	score: number
	prev?: number
	series?: number[]
	onClick?: () => void
}

export function PillarCard({ title = 'Score by pillar', pillars }: { title?: string; pillars: Pillar[] }) {
	return (
		<Card>
			<Section title={title} dense>
				<div className="flex flex-col">
					{pillars.map(p => (
						<PillarRow key={p.id} label={p.label} score={p.score} prev={p.prev} series={p.series} onClick={p.onClick} />
					))}
				</div>
			</Section>
		</Card>
	)
}
