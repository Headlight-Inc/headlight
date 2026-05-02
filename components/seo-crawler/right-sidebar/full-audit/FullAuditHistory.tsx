import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	DistBlock, TrendBlock, CompareBlock, TimelineBlock, DrillFooter, EmptyState,
	KpiRow, KpiTile, Card, Section, compactNum,
} from '../_shared'

export function FullAuditHistory() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl history yet" />

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Crawl runs" dense>
					<KpiRow>
						<KpiTile label="Runs" value={compactNum(s.history.runs)} />
						<KpiTile label="Last run" value={s.history.lastRunRel} />
						<KpiTile label="Score 30d avg" value={`${s.history.score30dAvg}`} />
						<KpiTile label="Errors 30d avg" value={`${Math.round(s.history.errors30dAvg)}`} />
					</KpiRow>
				</Section>
			</Card>

			<DistBlock title="Crawl outcome" segments={[
				{ value: s.history.success, tone: 'good', label: 'Success' },
				{ value: s.history.partial, tone: 'warn', label: 'Partial' },
				{ value: s.history.failed, tone: 'bad', label: 'Failed' },
			]} />

			<TrendBlock title="Score (12 weeks)" values={s.history.scoreSeries} tone="info" />

			<CompareBlock title="Now vs last vs 30d avg" rows={[
				{ label: 'Score', a: { v: s.score, tag: 'now' }, b: { v: s.scorePrev, tag: 'prev' }, c: { v: s.history.score30dAvg, tag: 'avg' } },
				{ label: 'Pages', a: { v: s.total, tag: 'now' }, b: { v: s.history.totalPrev, tag: 'prev' }, c: { v: s.history.total30dAvg, tag: 'avg' } },
				{ label: 'Errors', a: { v: s.issues.errors, tag: 'now' }, b: { v: s.history.errors30dAvg, tag: 'avg' }, c: { v: s.history.errors30dAvg, tag: 'avg' } },
			]} />

			<TimelineBlock title="Recent crawls" entries={s.history.recent.map((c: any) => ({
				id: c.id, ts: c.relTime, title: `${c.score} · ${c.label}`,
				detail: `${compactNum(c.pages)} pages · ${compactNum(c.errors)} errors`,
				tone: c.outcome === 'failed' ? 'bad' : c.outcome === 'partial' ? 'warn' : 'good',
			}))} max={8} />

			<DrillFooter chips={[
				{ label: 'Recrawl' },
				{ label: 'Compare' },
				{ label: 'Export' },
			]} />
		</div>
	)
}
