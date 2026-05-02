import React, { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	HeroStrip, DistRowsBlock, TopListBlock, SegmentBlock, BenchmarkBlock, DrillFooter,
	EmptyState, RankBucketsBlock, KpiRow, KpiTile, Card, Section, compactNum, fmtPct, scoreToTone,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

export function FullAuditOpportunities() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	const striking = useMemo(() => pages
		.filter((p) => num(p.gscPosition) > 10 && num(p.gscPosition) <= 20 && num(p.gscImpressions) > 0)
		.sort((a, b) => num(b.gscImpressions) - num(a.gscImpressions))
		.slice(0, 8), [pages])

	const lowCtr = useMemo(() => pages
		.filter((p) => num(p.gscPosition) > 0 && num(p.gscPosition) <= 10 && num(p.gscCtr) > 0 && num(p.gscCtr) < 0.02)
		.sort((a, b) => num(b.gscImpressions) - num(a.gscImpressions))
		.slice(0, 8), [pages])

	const quickWins = useMemo(() => pages
		.filter((p) => num(p.opportunityScore) >= 70 && num(p.gscPosition) <= 20)
		.sort((a, b) => num(b.opportunityScore) - num(a.opportunityScore))
		.slice(0, 8), [pages])

	const highValueLow = useMemo(() => pages
		.filter((p) => num(p.businessValueScore) >= 70 && num(p.engagementScore) <= 40)
		.sort((a, b) => num(b.businessValueScore) - num(a.businessValueScore))
		.slice(0, 8), [pages])

	if (!pages?.length) return <EmptyState title="No crawl data yet" />

	return (
		<div className="flex flex-col gap-3 p-3">
			<HeroStrip
				title="Opportunity"
				ring="gauge"
				score={Math.round(((s.oppRanks.striking + s.oppRanks.quickWins + s.oppRanks.highValueLowEng) / Math.max(1, s.total)) * 100)}
				scoreLabel="Opportunity score"
				kpis={[
					{ label: 'Striking', value: compactNum(s.oppRanks.striking) },
					{ label: 'Low CTR', value: compactNum(s.oppRanks.lowCtr) },
					{ label: 'Quick wins', value: compactNum(s.oppRanks.quickWins) },
					{ label: 'High value · low eng', value: compactNum(s.oppRanks.highValueLowEng) },
				]}
			/>

			<RankBucketsBlock title="Rank distribution" buckets={[
				{ label: '1-3', value: s.rankBuckets.top3, tone: 'good' },
				{ label: '4-10', value: s.rankBuckets.top10, tone: 'good' },
				{ label: '11-20', value: s.rankBuckets.striking, tone: 'warn' },
				{ label: '21-50', value: s.rankBuckets.tail, tone: 'info' },
				{ label: '51+', value: s.rankBuckets.deep, tone: 'neutral' },
			]} hint="Striking distance pages live in 11-20." />

			<TopListBlock
				title="Striking distance"
				items={striking.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `pos ${num(p.gscPosition).toFixed(1)} · ${compactNum(num(p.gscImpressions))} impr`,
					onClick: () => drill.toPage(p),
				}))}
				onSeeAll={() => drill.toCategory('search', 'Striking distance')}
			/>

			<TopListBlock
				title="Low CTR on page 1"
				items={lowCtr.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `${fmtPct(num(p.gscCtr) * 100)} · pos ${num(p.gscPosition).toFixed(1)}`,
					onClick: () => drill.toPage(p),
				}))}
			/>

			<TopListBlock
				title="Quick wins"
				items={quickWins.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `score ${Math.round(num(p.opportunityScore))}`,
					onClick: () => drill.toPage(p),
				}))}
			/>

			<TopListBlock
				title="High value, low engagement"
				items={highValueLow.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `bv ${Math.round(num(p.businessValueScore))} · eng ${Math.round(num(p.engagementScore))}`,
					onClick: () => drill.toPage(p),
				}))}
			/>

			<Card>
				<Section title="Projected uplift if all quick wins shipped" dense>
					<KpiRow>
						<KpiTile label="Δ score" value={`+${Math.round(s.actions.forecast.deltaScore || s.oppRanks.quickWins * 0.5)}`} tone="good" />
						<KpiTile label="Δ clicks/mo" value={compactNum(s.actions.forecast.deltaClicks || s.oppRanks.quickWins * 12)} tone="good" />
						<KpiTile label="Horizon" value={`${s.actions.forecast.horizonDays}d`} />
						<KpiTile label="Confidence" value={fmtPct((s.actions.forecast.confidence || 0.7) * 100)} tone={scoreToTone((s.actions.forecast.confidence || 0.7) * 100)} />
					</KpiRow>
				</Section>
			</Card>

			<DrillFooter chips={[
				{ label: 'Striking', count: s.oppRanks.striking },
				{ label: 'Low CTR', count: s.oppRanks.lowCtr },
				{ label: 'Quick wins', count: s.oppRanks.quickWins },
				{ label: 'Decay', count: s.oppRanks.highValueDecay },
			]} />
		</div>
	)
}
