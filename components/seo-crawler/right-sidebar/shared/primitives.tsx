import * as React from 'react'
import { fmtInt, fmtPct, scoreTone } from './format'

export function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
			{children}
		</div>
	)
}

export function Card({
	title,
	children,
	right,
}: {
	title?: React.ReactNode
	children: React.ReactNode
	right?: React.ReactNode
}) {
	return (
		<div className="mx-3 mb-3 rounded-md border border-[#1a1a1a] bg-[#0e0e0e]">
			{(title || right) && (
				<div className="flex items-center justify-between px-3 py-2 border-b border-[#161616]">
					<span className="text-[12px] font-medium text-neutral-200">{title}</span>
					{right}
				</div>
			)}
			<div className="p-3">{children}</div>
		</div>
	)
}

export function StatTile({
	label,
	value,
	sub,
	tone = 'neutral',
}: {
	label: string
	value: React.ReactNode
	sub?: React.ReactNode
	tone?: 'good' | 'warn' | 'bad' | 'neutral'
}) {
	const toneClass =
		tone === 'good' ? 'text-emerald-400'
		: tone === 'warn' ? 'text-amber-400'
		: tone === 'bad' ? 'text-rose-400'
		: 'text-neutral-100'
	return (
		<div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-2">
			<div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
			<div className={`mt-1 text-[15px] font-semibold ${toneClass}`}>{value}</div>
			{sub && <div className="mt-0.5 text-[10px] text-neutral-500">{sub}</div>}
		</div>
	)
}

export function Bar({
	value, // 0..100
	tone = 'neutral',
	color: customColor,
}: {
	value: number
	tone?: 'good' | 'warn' | 'bad' | 'neutral'
	color?: string
}) {
	const pct = Math.max(0, Math.min(100, value))
	const bgColor = customColor || (
		tone === 'good' ? '#10b981'
		: tone === 'warn' ? '#f59e0b'
		: tone === 'bad' ? '#f43f5e'
		: '#525252'
	)
	return (
		<div className="h-1.5 w-full rounded bg-[#1a1a1a] overflow-hidden">
			<div className="h-full" style={{ width: `${pct}%`, backgroundColor: bgColor }} />
		</div>
	)
}

export function Row({
	label,
	value,
}: {
	label: React.ReactNode
	value: React.ReactNode
}) {
	return (
		<div className="flex items-center justify-between text-[12px] py-1">
			<span className="text-neutral-400">{label}</span>
			<span className="text-neutral-100 font-medium">{value}</span>
		</div>
	)
}

export function Chip({
	children,
	tone = 'neutral',
}: {
	children: React.ReactNode
	tone?: 'good' | 'warn' | 'bad' | 'neutral' | 'accent'
}) {
	const cls =
		tone === 'good' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
		: tone === 'warn' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
		: tone === 'bad' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
		: tone === 'accent' ? 'bg-[#F5364E]/10 text-[#F5364E] border-[#F5364E]/30'
		: 'bg-neutral-500/10 text-neutral-300 border-neutral-500/30'
	return (
		<span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] ${cls}`}>
			{children}
		</span>
	)
}

export function TopList({
	items,
	render,
	empty = 'No data',
}: {
	items: ReadonlyArray<any>
	render: (item: any, i: number) => React.ReactNode
	empty?: string
}) {
	if (!items.length) {
		return <div className="text-[11px] text-neutral-500 italic">{empty}</div>
	}
	return <div className="space-y-1">{items.map((it, i) => render(it, i))}</div>
}

export function Gauge({
	value,
	max = 100,
	label,
}: { value: number; max?: number; label?: string }) {
	const pct = Math.max(0, Math.min(1, value / max))
	const tone = scoreTone(value)
	return (
		<div className="flex items-center gap-2">
			<div className="text-[18px] font-semibold tabular-nums" style={{ color: tone }}>
				{Math.round(value)}
			</div>
			<div className="flex-1">
				<Bar value={pct * 100} tone={value >= 80 ? 'good' : value >= 50 ? 'warn' : 'bad'} />
				{label && <div className="mt-1 text-[10px] text-neutral-500">{label}</div>}
			</div>
		</div>
	)
}
