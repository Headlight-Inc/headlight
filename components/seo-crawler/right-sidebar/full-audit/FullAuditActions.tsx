import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	DistBlock, DistRowsBlock, TopListBlock, SegmentBlock, TrendBlock, FunnelBlock,
	DrillFooter, EmptyState, KpiRow, KpiTile, Card, Section, ActionsBlock,
	compactNum, fmtPct, scoreToTone,
} from '../_shared'

export function FullAuditActions() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl data yet" />

	const suggested = s.actions.open + s.actions.snoozed
	const approved = s.actions.open
	const doneCount = s.actions.done

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Action queue" dense>
					<KpiRow>
						<KpiTile label="Open" value={compactNum(s.actions.open)} tone={s.actions.open > 0 ? 'warn' : 'neutral'} />
						<KpiTile label="Done" value={compactNum(s.actions.done)} tone="good" />
						<KpiTile label="Snoozed" value={compactNum(s.actions.snoozed)} />
						<KpiTile label="Critical" value={compactNum(s.actions.critical)} tone={s.actions.critical > 0 ? 'bad' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			<DistBlock title="By severity" segments={[
				{ value: s.actions.critical, tone: 'bad', label: 'Critical' },
				{ value: s.actions.high, tone: 'warn', label: 'High' },
				{ value: s.actions.med, tone: 'info', label: 'Medium' },
				{ value: s.actions.low, tone: 'neutral', label: 'Low' },
			]} />

			<SegmentBlock title="By category" headers={['Category', 'Open', 'Done', 'Snoozed']} rows={
				s.actions.byCategory.slice(0, 8).map((c: any) => ({
					id: c.id, label: c.label, values: [c.open, c.done, c.snoozed],
				}))
			} />

			<TrendBlock title="Done (6 sessions)" values={s.actions.doneSeries} tone="good" />

			<FunnelBlock title="Action funnel" steps={[
				{ id: 'sug', label: 'Suggested', value: suggested },
				{ id: 'app', label: 'Approved', value: approved },
				{ id: 'don', label: 'Done', value: doneCount },
			]} />

			<TopListBlock
				title="Top recommended"
				items={s.actions.top.map((p: any) => ({
					id: p.url, primary: p.recommendedAction, secondary: p.title || p.url,
					tail: p.opportunityScore ? `score ${Math.round(Number(p.opportunityScore))}` : '',
					onClick: () => drill.toPage(p),
				}))}
				emptyText="No actions queued"
			/>

			<Card>
				<Section title="Impact forecast" dense>
					<KpiRow>
						<KpiTile label="Δ score" value={`+${Math.round(s.actions.forecast.deltaScore || s.actions.open * 0.4)}`} tone="good" />
						<KpiTile label="Δ clicks/mo" value={compactNum(s.actions.forecast.deltaClicks || s.actions.open * 8)} tone="good" />
						<KpiTile label="Horizon" value={`${s.actions.forecast.horizonDays}d`} />
						<KpiTile label="Confidence" value={fmtPct((s.actions.forecast.confidence || 0.7) * 100)} tone={scoreToTone((s.actions.forecast.confidence || 0.7) * 100)} />
					</KpiRow>
				</Section>
			</Card>

			<DrillFooter chips={[
				{ label: 'Open', count: s.actions.open },
				{ label: 'Done', count: s.actions.done },
				{ label: 'Critical', count: s.actions.critical },
			]} />
		</div>
	)
}
