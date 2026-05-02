import React, { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, DistBlock, TrendBlock,
	TopListBlock, SegmentBlock, CompareBlock,
	EmptyState, RankBucketsBlock, SplitListBlock, compactNum, fmtPct,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

export function FullAuditSearch() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()

	const striking = useMemo(() => (pages ?? [])
		.filter((p: any) => num(p.gscPosition) > 10 && num(p.gscPosition) <= 20 && num(p.gscImpressions) > 0)
		.sort((a: any, b: any) => num(b.gscImpressions) - num(a.gscImpressions))
		.slice(0, 6), [pages])

	const lowCtr = useMemo(() => (pages ?? [])
		.filter((p: any) => num(p.gscPosition) > 0 && num(p.gscPosition) <= 10 && num(p.gscCtr) > 0 && num(p.gscCtr) < 0.02)
		.sort((a: any, b: any) => num(b.gscImpressions) - num(a.gscImpressions))
		.slice(0, 6), [pages])

	const topPages = useMemo(() => [...(pages ?? [])]
		.sort((a: any, b: any) => num(b.gscClicks) - num(a.gscClicks))
		.slice(0, 6), [pages])

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const brandTotal = num(s.search.brandClicks) + num(s.search.nonBrandClicks)
	const hasBrandSplit = brandTotal > 0

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Search">
					<KpiRow>
						<KpiTile label="Clicks" value={compactNum(s.search.clicksTotal)} />
						<KpiTile label="Impr" value={compactNum(s.search.imprTotal)} />
						<KpiTile label="CTR" value={fmtPct(s.search.ctr * 100, 1)} tone={s.search.ctr > 0.03 ? 'good' : 'neutral'} />
						<KpiTile label="Avg pos" value={s.search.avgPosition.toFixed(1)} tone={s.search.avgPosition < 10 ? 'good' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			{s.hasPrior && (
				<TrendBlock title="Clicks trend" values={s.search.clicksSeries} tone="good" hint="Last 12 weeks" />
			)}

			<RankBucketsBlock
				title="Rank buckets"
				buckets={[
					{ label: '1–3', value: s.search.rankBuckets.top3, tone: 'good', onClick: () => drill.toCategory('search', 'top3') },
					{ label: '4–10', value: s.search.rankBuckets.top10, tone: 'good', onClick: () => drill.toCategory('search', 'top10') },
					{ label: '11–20', value: s.search.rankBuckets.striking, tone: 'warn', onClick: () => drill.toCategory('search', 'striking') },
					{ label: '21–50', value: s.search.rankBuckets.tail, tone: 'info' },
					{ label: '50+', value: s.search.rankBuckets.deep, tone: 'neutral' },
				]}
			/>

			{hasBrandSplit && (
				<Card>
					<Section title="Brand vs non-brand">
						<KpiRow>
							<KpiTile label="Brand" value={compactNum(s.search.brandClicks)} hint={fmtPct((s.search.brandClicks / brandTotal) * 100)} />
							<KpiTile label="Non-brand" value={compactNum(s.search.nonBrandClicks)} hint={fmtPct((s.search.nonBrandClicks / brandTotal) * 100)} tone="good" />
						</KpiRow>
					</Section>
				</Card>
			)}

			<DistBlock
				title="Device"
				segments={[
					{ label: 'Mobile', value: s.search.mobileClicks, tone: 'info' },
					{ label: 'Desktop', value: s.search.desktopClicks, tone: 'neutral' },
					{ label: 'Tablet', value: s.search.tabletClicks, tone: 'neutral' },
				]}
			/>

			<TopListBlock
				title="Striking distance (pages 11–20)"
				items={striking.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `pos ${num(p.gscPosition).toFixed(1)} · ${compactNum(num(p.gscImpressions))} impr`,
					onClick: () => drill.toPage(p),
				}))}
				onSeeAll={() => drill.toCategory('search', 'Striking distance')}
				emptyText="No pages in striking distance"
			/>

			{lowCtr.length > 0 && (
				<TopListBlock
					title="Top-10 with low CTR"
					items={lowCtr.map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${fmtPct(num(p.gscCtr) * 100, 1)} · pos ${num(p.gscPosition).toFixed(1)}`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{s.search.topQueries?.length > 0 && (
				<TopListBlock
					title="Top queries"
					items={s.search.topQueries.slice(0, 6).map((q: any) => ({
						id: q.query, primary: q.query, tail: compactNum(num(q.clicks)),
						onClick: () => drill.toCategory('search', q.query),
					}))}
				/>
			)}

			{topPages.length > 0 && (
				<TopListBlock
					title="Top pages by clicks"
					items={topPages.map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: compactNum(num(p.gscClicks)),
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{s.hasPrior && (s.search.winners?.length > 0 || s.search.losers?.length > 0) && (
				<SplitListBlock
					title="Winners vs losers"
					left={(s.search.winners ?? []).slice(0, 5).map((p: any) => ({ id: p.url, primary: p.title || p.url, tail: `+${num(p.gscClicksDelta)}`, onClick: () => drill.toPage(p) }))}
					right={(s.search.losers ?? []).slice(0, 5).map((p: any) => ({ id: p.url, primary: p.title || p.url, tail: `${num(p.gscClicksDelta)}`, onClick: () => drill.toPage(p) }))}
				/>
			)}

			{s.hasPrior && s.search.lostQueries?.length > 0 && (
				<TopListBlock
					title="Lost queries"
					items={s.search.lostQueries.slice(0, 6).map((q: any) => ({
						id: q.query, primary: q.query, tail: `${num(q.clicksDelta)} clicks`,
					}))}
				/>
			)}

			{s.hasPrior && s.search.growingQueries?.length > 0 && (
				<TopListBlock
					title="Growing queries"
					items={s.search.growingQueries.slice(0, 6).map((q: any) => ({
						id: q.query, primary: q.query, tail: `+${num(q.clicksDelta)} · pos ${num(q.pos).toFixed(1)}`,
					}))}
				/>
			)}

			{s.search.cannibal?.length > 0 && (
				<TopListBlock
					title="Cannibalisation"
					items={s.search.cannibal.slice(0, 5).map((c: any) => ({
						id: c.query, primary: c.query,
						secondary: c.pages.map((p: any) => p.url).slice(0, 2).join(' · '),
						tail: `${c.pages.length} pages`,
						onClick: () => drill.toCategory('search', `cannibal:${c.query}`),
					}))}
				/>
			)}

			{s.search.countryMix?.length > 0 && (
				<TopListBlock
					title="Country mix"
					items={s.search.countryMix.slice(0, 6).map((c: any) => ({ id: c.id, primary: c.id, tail: compactNum(c.value) }))}
				/>
			)}

			{s.hasPrior && (
				<CompareBlock
					title="vs previous crawl"
					rows={[
						{ label: 'Clicks', a: { v: s.search.clicksTotal, tag: 'now' }, b: { v: s.search.clicksPrev, tag: 'prev' }, format: compactNum },
						{ label: 'Impr', a: { v: s.search.imprTotal, tag: 'now' }, b: { v: s.search.imprPrev, tag: 'prev' }, format: compactNum },
						{ label: 'Avg pos', a: { v: s.search.avgPosition, tag: 'now' }, b: { v: s.search.avgPositionPrev, tag: 'prev' }, format: (v) => v.toFixed(1) },
					]}
				/>
			)}
		</div>
	)
}
