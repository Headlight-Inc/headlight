import * as React from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'

export function RsTabBar() {
	const { mode, rsTab, setRsTab } = useSeoCrawler()
	const desc = getMode(mode)
	if (!desc) return null
	const active = rsTab[mode] ?? desc.rsTabs[0]?.id

	return (
		<nav
			role="tablist"
			className="flex h-9 items-stretch border-b border-[#161616] overflow-x-auto no-scrollbar"
		>
			{desc.rsTabs.map((t) => {
				const isActive = t.id === active
				return (
					<button
						key={t.id}
						role="tab"
						aria-selected={isActive}
						onClick={() => setRsTab(mode, t.id)}
						className={`relative flex-shrink-0 px-3 text-[11px] font-medium transition-colors ${
							isActive ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
						}`}
					>
						{t.label}
						{isActive && (
							<span className="absolute inset-x-2 top-0 h-[2px] rounded-b bg-[#F5364E]" />
						)}
					</button>
				)
			})}
		</nav>
	)
}
