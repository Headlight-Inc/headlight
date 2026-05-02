import React, { useMemo, useState } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, IssueAreaGridBlock,
	WhatBlocksScoreCard, QuadrantBlock, RecommendedActionsBlock,
	OwnerLoadBlock, TrendBlock, ImpactForecastCard,
	EmptyState, compactNum,
} from '../_shared'

type Filter = 'all' | 'critical' | 'high'

export function FullAuditFixes() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()
	const [filter, setFilter] = useState<Filter>('all')

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const tiles = useMemo(() => ([
		{ id: 'tech', label: 'Tech', count: s.issues.errors4xx + s.issues.errors5xx + s.tech.redirectChains, tone: 'bad' as const, hint: '4xx · 5xx · chains', onClick: () => drill.toCategory('codes', 'All') },
		{ id: 'idx', label: 'Indexability', count: s.issues.notIndexable + s.issues.canonicalMismatch, tone: 'warn' as const, hint: 'noindex · canonical', onClick: () => drill.toCategory('indexability', 'Non-Indexable') },
		{ id: 'perf', label: 'Performance', count: s.perf.lcpFail + s.perf.inpFail + s.perf.clsFail, tone: 'warn' as const, hint: 'LCP · INP · CLS', onClick: () => drill.toCategory('performance', 'Poor LCP') },
		{ id: 'sec', label: 'Security', count: s.tech.hstsMissing + s.tech.cspMissing + s.tech.sslInvalid + s.tech.mixedContent, tone: 'warn' as const, hint: 'HSTS · CSP · TLS', onClick: () => drill.toCategory('security', 'All') },
		{ id: 'cnt', label: 'Content', count: s.content.thinPages + s.content.duplicates + s.issues.missingTitle + s.issues.missingMeta, tone: 'info' as const, hint: 'thin · dup · meta' },
		{ id: 'lnk', label: 'Links', count: s.issues.broken + s.issues.orphans, tone: 'info' as const, hint: 'broken · orphans', onClick: () => drill.toCategory('links', 'Orphan Pages') },
		{ id: 'schema', label: 'Schema', count: Math.max(0, Math.round((100 - (s.ai?.schemaCoverage ?? 0)) / 5)), tone: 'info' as const, hint: 'rich-result gaps' },
		{ id: 'a11y', label: 'A11y', count: s.tech.a11y?.issues ?? 0, tone: 'info' as const, hint: 'WCAG 2.2 AA' },
	]), [s, drill])

	const filtered = useMemo(() => {
		if (filter === 'all') return s.recommendations
		return s.recommendations.filter((r: any) => r.priority === filter)
	}, [s, filter])

	const showForecast = ((s.actions.forecast?.deltaScore ?? 0) + (s.actions.forecast?.deltaClicks ?? 0)) > 0

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Severity">
					<KpiRow>
						<KpiTile label="Critical" value={s.issues.errors5xx} tone={s.issues.errors5xx > 0 ? 'bad' : 'neutral'} />
						<KpiTile label="High" value={s.issues.errors4xx + s.issues.notIndexable + s.tech.sslInvalid} tone="bad" />
						<KpiTile label="Medium" value={s.perf.lcpFail + s.perf.inpFail + s.tech.redirectChains} tone="warn" />
						<KpiTile label="Low" value={s.issues.missingMeta + s.issues.missingAlt + s.tech.cspMissing} tone="info" />
					</KpiRow>
				</Section>
			</Card>

			<IssueAreaGridBlock tiles={tiles} />

			{s.deductions?.length > 0 && (
				<WhatBlocksScoreCard deductions={s.deductions} totalLost={Math.max(0, 100 - s.score)} />
			)}

			{showForecast && (
				<ImpactForecastCard
					deltaScore={s.actions.forecast.deltaScore}
					deltaClicks={s.actions.forecast.deltaClicks}
					horizonDays={s.actions.forecast.horizonDays}
					confidence={s.actions.forecast.confidence}
				/>
			)}

			{s.actions.effortImpact?.length > 0 && (
				<QuadrantBlock
					title="Effort × impact"
					items={s.actions.effortImpact}
					onCellClick={(c) => drill.toCategory('action', `impact:${c.impact}|effort:${c.effort}`)}
				/>
			)}

			<Card>
				<Section title="Filter">
					<div className="flex gap-1.5">
						{(['all', 'critical', 'high'] as Filter[]).map(f => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-2 py-0.5 rounded text-[11px] capitalize border ${filter === f ? 'border-[#333] bg-[#1a1a1a] text-white' : 'border-[#222] text-[#888] hover:text-white'}`}
							>
								{f}
							</button>
						))}
					</div>
				</Section>
			</Card>

			<RecommendedActionsBlock
				items={filtered.slice(0, 12).map((r: any) => ({ ...r, onClick: () => drill.toCategory('action', r.id) }))}
				onSeeAll={() => drill.toCategory('action', filter)}
				seeAllLabel={`See all ${filtered.length}`}
			/>

			<OwnerLoadBlock
				rows={s.actions.ownerLoad}
				onClick={(id) => drill.toCategory('owner', id)}
			/>

			{s.hasPrior && (
				<TrendBlock
					title="Action backlog (last 7 runs)"
					values={s.actions.doneSeries}
					tone="good"
					hint="Items closed per crawl"
				/>
			)}
		</div>
	)
}
