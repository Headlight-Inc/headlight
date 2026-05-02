import React, { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	DistBlock, DistRowsBlock, TopListBlock, SegmentBlock, TrendBlock, CompareBlock,
	DrillFooter, EmptyState, KpiTile, KpiRow, Card, Section, compactNum, fmtPct,
} from '../_shared'

export function FullAuditIssues() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	const severityRows = useMemo(() => ([
		{ label: 'Critical', value: s.issues.errors5xx + s.issues.errors4xx, tone: 'bad' as const },
		{ label: 'High', value: s.issues.notIndexable + s.issues.broken + s.tech.sslInvalid, tone: 'bad' as const },
		{ label: 'Medium', value: s.perf.lcpFail + s.perf.inpFail + s.tech.redirectChains, tone: 'warn' as const },
		{ label: 'Low', value: s.issues.missingMeta + s.issues.missingAlt + s.tech.cspMissing, tone: 'info' as const },
	]), [s])

	const byArea = useMemo(() => ([
		{ id: 'tech', label: 'Technical', values: [s.issues.errors4xx + s.issues.errors5xx + s.tech.redirectChains, '4xx, 5xx, chains'] },
		{ id: 'idx', label: 'Indexability', values: [s.issues.notIndexable + s.issues.canonicalMismatch, 'noindex, canonical'] },
		{ id: 'perf', label: 'Performance', values: [s.perf.lcpFail + s.perf.inpFail + s.perf.clsFail, 'LCP, INP, CLS'] },
		{ id: 'sec', label: 'Security', values: [s.tech.hstsMissing + s.tech.cspMissing + s.tech.sslInvalid + s.tech.mixedContent, 'HSTS, CSP, TLS'] },
		{ id: 'cnt', label: 'Content', values: [s.content.thinPages + s.content.duplicates + s.issues.missingTitle + s.issues.missingMeta, 'thin, dup, meta'] },
		{ id: 'lnk', label: 'Links', values: [s.issues.broken + s.issues.orphans, 'broken, orphans'] },
	]), [s])

	const topIssues = useMemo(() => ([
		{ id: 'thin', primary: 'Thin content', tail: compactNum(s.content.thinPages) },
		{ id: 'mAlt', primary: 'Missing alt text', tail: compactNum(s.content.missingAlt) },
		{ id: 'lcp', primary: 'Slow LCP', tail: compactNum(s.perf.lcpFail) },
		{ id: 'cnu', primary: 'Canonical mismatch', tail: compactNum(s.issues.canonicalMismatch) },
		{ id: 'idx', primary: 'Not indexable', tail: compactNum(s.issues.notIndexable) },
		{ id: 'bln', primary: 'Broken internal links', tail: compactNum(s.issues.broken) },
		{ id: 'orp', primary: 'Orphan pages', tail: compactNum(s.issues.orphans) },
		{ id: 'sch', primary: 'Schema errors', tail: compactNum(s.content.schemaErrors) },
		{ id: 'sec', primary: 'Missing HSTS', tail: compactNum(s.tech.hstsMissing) },
		{ id: 'mxc', primary: 'Mixed content', tail: compactNum(s.tech.mixedContent) },
	]).sort((a, b) => Number(b.tail) - Number(a.tail)), [s])

	if (!pages?.length) return <EmptyState title="No crawl data yet" hint="Issues appear as pages are scanned." />

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Issue volume" dense>
					<KpiRow>
						<KpiTile label="Errors" value={compactNum(s.issues.errors)} tone={s.issues.errors > 0 ? 'bad' : 'neutral'} />
						<KpiTile label="Warnings" value={compactNum(s.issues.warnings)} tone={s.issues.warnings > 0 ? 'warn' : 'neutral'} />
						<KpiTile label="Notices" value={compactNum(s.issues.notices)} tone="info" />
						<KpiTile label="Pages affected" value={fmtPct(s.total > 0 ? ((s.issues.errors + s.issues.warnings + s.issues.notices) / s.total) * 100 : 0)} />
					</KpiRow>
				</Section>
			</Card>

			<DistRowsBlock title="Severity" rows={severityRows} />

			<SegmentBlock title="By area" headers={['Area', 'Total', 'Examples']} rows={byArea} />

			<TopListBlock
				title="Top issues"
				items={topIssues.slice(0, 8)}
				onSeeAll={() => drill.toCategory('status', 'All')}
			/>

			<TrendBlock title="Errors trend (6 sessions)" values={[s.issues.errorsPrev, s.issues.errors]} tone={s.issues.errors > s.issues.errorsPrev ? 'bad' : 'good'} />

			<CompareBlock title="This crawl vs last" rows={[
				{ label: 'Errors', a: { v: s.issues.errors, tag: 'now' }, b: { v: s.issues.errorsPrev, tag: 'prev' } },
				{ label: 'Warnings', a: { v: s.issues.warnings, tag: 'now' }, b: { v: s.issues.warningsPrev, tag: 'prev' } },
			]} />

			<DrillFooter chips={[
				{ label: '4xx', count: s.issues.errors4xx, onClick: () => drill.toCategory('codes', '404 Not Found') },
				{ label: '5xx', count: s.issues.errors5xx, onClick: () => drill.toCategory('codes', '500 Server Error') },
				{ label: 'Noindex', count: s.issues.notIndexable, onClick: () => drill.toCategory('indexability', 'Non-Indexable') },
				{ label: 'Orphans', count: s.issues.orphans, onClick: () => drill.toCategory('links', 'Orphan Pages') },
			]} />
		</div>
	)
}
