import * as React from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'
import { RsTabBar } from './RsTabBar'
import { RsRouter } from './RsRouter'

const MIN_W = 280
const MAX_W = 520

export function RsShell() {
	const {
		mode, showAuditSidebar,
		auditSidebarWidth, setAuditSidebarWidth,
		isDraggingSidebar, setIsDraggingSidebar,
	} = useSeoCrawler()

	const desc = getMode(mode)
	const startX = React.useRef(0)
	const startW = React.useRef(0)

	const onMouseDown = (e: React.MouseEvent) => {
		startX.current = e.clientX
		startW.current = auditSidebarWidth
		setIsDraggingSidebar(true)
		document.body.style.cursor = 'col-resize'
		const onMove = (ev: MouseEvent) => {
			const dx = startX.current - ev.clientX
			const next = Math.max(MIN_W, Math.min(MAX_W, startW.current + dx))
			setAuditSidebarWidth(next)
		}
		const onUp = () => {
			setIsDraggingSidebar(false)
			document.body.style.cursor = ''
			window.removeEventListener('mousemove', onMove)
			window.removeEventListener('mouseup', onUp)
		}
		window.addEventListener('mousemove', onMove)
		window.addEventListener('mouseup', onUp)
	}

	if (!showAuditSidebar || !desc) return null

	return (
		<aside
			className="relative flex h-full flex-col border-l border-[#1a1a1a] bg-[#0a0a0a]"
			style={{ width: auditSidebarWidth, minWidth: MIN_W, maxWidth: MAX_W }}
		>
			<div
				onMouseDown={onMouseDown}
				className={`absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize ${
					isDraggingSidebar ? 'bg-[#F5364E]/40' : 'bg-transparent hover:bg-[#F5364E]/30'
				}`}
			/>
			<div className="flex h-9 items-center justify-between border-b border-[#161616] px-3">
				<span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
					{desc.label} insights
				</span>
			</div>
			<RsTabBar />
			<div className="flex-1 overflow-y-auto py-2">
				<RsRouter />
			</div>
		</aside>
	)
}
