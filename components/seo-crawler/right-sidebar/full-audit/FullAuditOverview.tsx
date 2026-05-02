import React, { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	HeroStrip, DistBlock, DistRowsBlock, TrendBlock, TopListBlock, SegmentBlock,
	BenchmarkBlock, CompareBlock, DrillFooter, AlertsBlock, ActionsBlock, EmptyState,
	compactNum, fmtPct, scoreToTone,
} from '../_shared'
import { templateOf } from '../_shared/derive'

export function FullAuditOverview() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	const tplRows = useMemo(() => {
		if (!pages?.length) return []
		const m = new Map<string, { total: number; errors: number; thin: number }>()
		for (const p of pages) {
			const t = templateOf(p)
			const cur = m.get(t) || { total: 0, errors: 0, thin: 0 }
			cur.total++
			if (Number(p.statusCode) >= 400) cur.errors++
			if (Number(p.wordCount) > 0 && Number(p.wordCount) < 300) cur.thin++
			m.set(t, cur)
		}
		return [...m.entries()]
			.sort((a, b) => b[1].total - a[1].total)
			.slice(0, 6)
			.map(([id, v]) => ({ id, label: id, values: [v.total, v.errors, v.thin] }))
	}, [pages])

	if (!pages?.length) return <EmptyState title="No crawl data yet" hint="Start a crawl to see this tab." />

	const healthy = Math.max(0, s.total - s.issues.errors - s.issues.warnings - s.issues.notices)

	const alerts = [
		s.issues.errors > 0 ? { id: 'err', label: `${s.issues.errors} pages with 4xx or 5xx`, tone: 'bad' as const, onClick: () => drill.toCategory('codes', '404 Not Found') } : null,
		s.issues.notIndexable > 0 ? { id: 'idx', label: `${s.issues.notIndexable} pages not indexable`, tone: 'warn' as const, onClick: () => drill.toCategory('indexability', 'Non-Indexable') } : null,
		s.tech.cwvPass < 70 ? { id: 'cwv', label: `Only ${fmtPct(s.tech.cwvPass)} of pages pass CWV`, tone: 'warn' as const, onClick: () => drill.toCategory('performance', 'Poor LCP') } : null,
	].filter(Boolean) as any[]

	const topActions = s.actions.top.slice(0, 4).map((p: any) => ({
		id: p.url, label: p.recommendedAction, hint: p.title || p.url, onClick: () => drill.toPage(p),
	}))

	return (
		<div className="flex flex-col gap-3 p-3">
			<HeroStrip
				title="Snapshot"
				ring="gauge"
				score={s.score}
				scoreLabel="Site score"
				kpis={[
					{ label: 'Pages', value: compactNum(s.total) },
					{ label: 'Indexable', value: fmtPct(s.tech.indexable), tone: scoreToTone(s.tech.indexable) },
					{ label: 'CWV pass', value: fmtPct(s.tech.cwvPass), tone: scoreToTone(s.tech.cwvPass) },
					{ label: 'HTTPS', value: fmtPct(s.tech.httpsCoverage), tone: scoreToTone(s.tech.httpsCoverage) },
				]}
				trendCurrent={s.score}
				trendPrevious={s.scorePrev}
			/>

			<div className="grid grid-cols-1 @md:grid-cols-2 gap-3">
				<DistBlock title="Page health" segments={[
					{ value: s.issues.errors, tone: 'bad', label: 'Errors' },
					{ value: s.issues.warnings, tone: 'warn', label: 'Warnings' },
					{ value: s.issues.notices, tone: 'info', label: 'Notices' },
					{ value: healthy, tone: 'good', label: 'Healthy' },
				]} />

				<DistRowsBlock title="Severity by area" rows={[
					{ label: 'Indexability', value: s.issues.notIndexable, tone: 'warn' },
					{ label: 'Performance', value: s.perf.lcpFail + s.perf.inpFail + s.perf.clsFail, tone: 'bad' },
					{ label: 'Links', value: s.issues.broken + s.issues.orphans, tone: 'bad' },
					{ label: 'Schema', value: s.content.schemaErrors, tone: 'warn' },
					{ label: 'Content', value: s.content.thinPages + s.content.duplicates, tone: 'warn' },
				]} />

				<TrendBlock title="Score (12 weeks)" values={s.history.scoreSeries} tone="info" />

				<BenchmarkBlock title="CTR vs industry" site={s.search.ctr * 100} benchmark={s.bench.ctr * 100} unit="%" higherIsBetter />
			</div>

			<TopListBlock
				title="Worst pages by quality"
				items={s.worstPages.slice(0, 6).map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `score ${Math.round(Number(p.contentQualityScore || p.qualityScore))}`,
					onClick: () => drill.toPage(p),
				}))}
				onSeeAll={() => drill.toCategory('quality', 'All')}
				emptyText="No quality scores yet"
			/>

			<SegmentBlock title="By template" headers={['Template', 'Total', '4xx', 'Thin']} rows={tplRows} />

			<CompareBlock title="This crawl vs last" rows={[
				{ label: 'Indexable', a: { v: s.tech.indexable, tag: 'now' }, b: { v: s.tech.indexablePrev, tag: 'prev' }, format: fmtPct },
				{ label: 'Errors', a: { v: s.issues.errors, tag: 'now' }, b: { v: s.issues.errorsPrev, tag: 'prev' } },
				{ label: 'CWV pass', a: { v: s.tech.cwvPass, tag: 'now' }, b: { v: s.tech.cwvPassPrev, tag: 'prev' }, format: fmtPct },
			]} />

			{alerts.length > 0 ? <AlertsBlock title="Top alerts" items={alerts} /> : null}
			{topActions.length > 0 ? <ActionsBlock title="Top actions" items={topActions} /> : null}

			<DrillFooter chips={[
				{ label: 'Issues', count: s.issues.errors + s.issues.warnings, onClick: () => drill.toCategory('status', 'All') },
				{ label: 'Opportunities', count: s.oppRanks.striking + s.oppRanks.lowCtr },
				{ label: 'Actions', count: s.actions.open },
				{ label: 'History', count: s.history.runs },
			]} />
		</div>
	)
}
