import React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, Section, TopList } from '..'
import type { RsListItem } from '..'

export function SplitListBlock({
	title,
	leftLabel = 'Winners',
	rightLabel = 'Losers',
	left,
	right,
	max = 5,
}: {
	title: string
	leftLabel?: string
	rightLabel?: string
	left: ReadonlyArray<RsListItem>
	right: ReadonlyArray<RsListItem>
	max?: number
}) {
	return (
		<Card>
			<Section title={title} dense>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-400 mb-1">
							<ArrowUp size={10} /> {leftLabel}
						</div>
						<TopList items={left} max={max} />
					</div>
					<div>
						<div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-rose-400 mb-1">
							<ArrowDown size={10} /> {rightLabel}
						</div>
						<TopList items={right} max={max} />
					</div>
				</div>
			</Section>
		</Card>
	)
}
