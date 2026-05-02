import React from 'react'
import { Card } from '../Card'
import { Section } from '../Section'

export type IssueAreaTile = {
	id: string
	label: string
	count: number
	tone: 'good' | 'warn' | 'bad' | 'info' | 'neutral'
	hint?: string
	onClick?: () => void
}

const TONE: Record<IssueAreaTile['tone'], { fg: string; border: string }> = {
	good: { fg: '#10b981', border: '#064e3b' },
	warn: { fg: '#f59e0b', border: '#78350f' },
	bad:  { fg: '#ef4444', border: '#7f1d1d' },
	info: { fg: '#3b82f6', border: '#1e3a8a' },
	neutral: { fg: '#888', border: '#1a1a1a' },
}

export function IssueAreaGridBlock({ title = 'By area', tiles }: { title?: string; tiles: ReadonlyArray<IssueAreaTile> }) {
	return (
		<Card>
			<Section title={title} dense>
				<div className="grid grid-cols-3 gap-1.5">
					{tiles.map(t => (
						<button
							key={t.id}
							onClick={t.onClick}
							className="text-left rounded border bg-[#0a0a0a] hover:bg-[#0f0f0f] px-2 py-1.5 transition-colors"
							style={{ borderColor: TONE[t.tone].border }}
						>
							<div className="text-[9px] uppercase tracking-widest text-[#666]">{t.label}</div>
							<div className="mt-0.5 text-[15px] font-bold font-mono tabular-nums" style={{ color: TONE[t.tone].fg }}>
								{t.count.toLocaleString()}
							</div>
							{t.hint ? <div className="text-[9px] text-[#666] truncate">{t.hint}</div> : null}
						</button>
					))}
				</div>
			</Section>
		</Card>
	)
}
