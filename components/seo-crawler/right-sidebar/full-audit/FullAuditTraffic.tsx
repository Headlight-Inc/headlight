import React, { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, DistBlock, DistRowsBlock, TrendBlock,
	TopListBlock, SegmentBlock, HeatmapBlock, CompareBlock,
	EmptyState, compactNum, fmtPct,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

export function FullAuditTraffic() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()

	const heat = useMemo(() => {
		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		const hours = ['0', '3', '6', '9', '12', '15', '18', '21']
		const cells: Array<{ x: string; y: string; value: number }> = []
		let sum = 0
		for (const d of days) for (const h of hours) {
			const v = num(s.traffic.heatmap?.[`${d}::${h}`])
			cells.push({ x: h, y: d, value: v })
			sum += v
		}
		return { cells, xLabels: hours, yLabels: days, sum }
	}, [s])

	const topPages = useMemo(() => [...(pages ?? [])].sort((a: any, b: any) => num(b.sessions ?? b.ga4Sessions) - num(a.sessions ?? a.ga4Sessions)).slice(0, 6), [pages])
	const topByConv = useMemo(() => [...(pages ?? [])].sort((a: any, b: any) => num(b.ga4Conversions ?? b.conversions) - num(a.ga4Conversions ?? a.conversions)).slice(0, 6), [pages])
	const highBounceLandings = useMemo(() => (s.traffic.landings ?? []).filter((l: any) => num(l.bounce) > 0.6).slice(0, 6), [s])
	const topExits = useMemo(() => (s.traffic.exits ?? []).slice(0, 6), [s])

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const nvr = s.traffic.newVsReturning
	const nvrTotal = num(nvr?.new) + num(nvr?.returning)

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Traffic">
					<KpiRow>
						<KpiTile label="Sessions" value={compactNum(s.traffic.sessions)} />
						<KpiTile label="Users" value={compactNum(s.traffic.users)} />
						<KpiTile label="CVR" value={fmtPct((s.traffic.cvr ?? 0) * 100, 1)} tone={(s.traffic.cvr ?? 0) > 0.02 ? 'good' : 'neutral'} />
						<KpiTile label="Engaged" value={`${Math.round(s.traffic.engagementTime ?? 0)}s`} tone="info" />
					</KpiRow>
				</Section>
			</Card>

			{s.hasPrior && (
				<TrendBlock title="Sessions trend" values={s.traffic.sessionsSeries} tone="good" hint="Last 7 weeks" />
			)}

			<Card>
				<Section title="Quality">
					<KpiRow>
						<KpiTile label="Bounce" value={fmtPct((s.traffic.bounceRate ?? 0) * 100, 0)} tone={(s.traffic.bounceRate ?? 0) < 0.5 ? 'good' : 'warn'} />
						<KpiTile label="Conversions" value={compactNum(s.traffic.conversions)} />
						<KpiTile label="Pages/session" value={(s.traffic.pagesPerSession ?? 0).toFixed(1)} />
						<KpiTile label="Engaged rate" value={fmtPct((s.traffic.engagedRate ?? 0) * 100, 0)} tone="info" />
					</KpiRow>
				</Section>
			</Card>

			{nvrTotal > 0 && (
				<DistBlock
					title="New vs returning"
					segments={[
						{ label: 'New', value: nvr.new, tone: 'info' },
						{ label: 'Returning', value: nvr.returning, tone: 'good' },
					]}
				/>
			)}

			<DistRowsBlock
				title="Source mix"
				rows={[
					{ label: 'Organic', value: s.traffic.organic, tone: 'good' },
					{ label: 'Direct', value: s.traffic.direct, tone: 'info' },
					{ label: 'Referral', value: s.traffic.referral, tone: 'info' },
					{ label: 'Social', value: s.traffic.social, tone: 'neutral' },
					{ label: 'Paid', value: s.traffic.paid, tone: 'warn' },
					{ label: 'Email', value: s.traffic.email, tone: 'neutral' },
				]}
			/>

			<DistBlock
				title="Device"
				segments={[
					{ label: 'Mobile', value: s.traffic.mobile, tone: 'info' },
					{ label: 'Desktop', value: s.traffic.desktop, tone: 'neutral' },
					{ label: 'Tablet', value: s.traffic.tablet, tone: 'neutral' },
				]}
			/>

			{heat.sum >= 5 && (
				<HeatmapBlock title="Sessions by day · hour" cells={heat.cells} xLabels={heat.xLabels} yLabels={heat.yLabels} />
			)}

			{topPages.length > 0 && (
				<TopListBlock
					title="Top pages by sessions"
					items={topPages.map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: compactNum(num(p.sessions ?? p.ga4Sessions)),
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{topByConv.some((p: any) => num(p.ga4Conversions ?? p.conversions) > 0) && (
				<TopListBlock
					title="Top pages by conversions"
					items={topByConv.map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: compactNum(num(p.ga4Conversions ?? p.conversions)),
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{highBounceLandings.length > 0 && (
				<TopListBlock
					title="High-bounce landings"
					items={highBounceLandings.map((l: any) => ({
						id: l.url, primary: l.title || l.url, secondary: l.url,
						tail: `${fmtPct(num(l.bounce) * 100)} · ${compactNum(num(l.sessions))}`,
						onClick: () => drill.toCategory('traffic', `landing:${l.url}`),
					}))}
				/>
			)}

			{topExits.length > 0 && (
				<TopListBlock
					title="Top exit pages"
					items={topExits.map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${compactNum(num(p.exits))} · ${fmtPct(num(p.rate) * 100)}`,
						onClick: () => drill.toCategory('traffic', `exit:${p.url}`),
					}))}
				/>
			)}

			{s.traffic.sourceMix?.length > 0 && (
				<SegmentBlock
					title="Source breakdown"
					headers={['Source', 'Sessions', 'Conv', 'Bounce']}
					rows={s.traffic.sourceMix.slice(0, 6).map((m: any) => ({
						id: m.source, label: m.source,
						values: [compactNum(num(m.sessions)), num(m.conversions), fmtPct(num(m.bounce) * 100)],
					}))}
				/>
			)}

			{s.traffic.topByCountry?.length > 0 && (
				<TopListBlock
					title="Top countries"
					items={s.traffic.topByCountry.slice(0, 6).map((c: any) => ({ id: c.id, primary: c.id, tail: compactNum(c.value) }))}
				/>
			)}

			{s.hasPrior && (
				<CompareBlock
					title="vs previous crawl"
					rows={[
						{ label: 'Sessions', a: { v: s.traffic.sessions, tag: 'now' }, b: { v: s.traffic.sessionsPrev, tag: 'prev' }, format: compactNum },
						{ label: 'Bounce', a: { v: (s.traffic.bounceRate ?? 0) * 100, tag: 'now' }, b: { v: (s.traffic.bounceRatePrev ?? 0) * 100, tag: 'prev' }, format: (v) => fmtPct(v) },
						{ label: 'Conversions', a: { v: s.traffic.conversions, tag: 'now' }, b: { v: s.traffic.conversionsPrev, tag: 'prev' }, format: compactNum },
					]}
				/>
			)}
		</div>
	)
}
