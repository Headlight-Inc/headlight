import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, DistRowsBlock, TopListBlock,
	SegmentBlock, TrendBlock, ChecklistBlock,
	EmptyState, compactNum, fmtPct, scoreToTone,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

function FilePill({ label, on }: { label: string; on: boolean }) {
	return (
		<span className={`px-2 py-0.5 rounded text-[11px] border flex items-center gap-1.5 ${on ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-[#222] text-[#666]'}`}>
			<span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-400' : 'bg-[#444]'}`} />
			{label}
		</span>
	)
}

export function FullAuditAi() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const botList = [
		{ id: 'gptbot', label: 'GPTBot' },
		{ id: 'oai-search', label: 'OAI-SearchBot' },
		{ id: 'chatgpt-user', label: 'ChatGPT-User' },
		{ id: 'claude', label: 'ClaudeBot' },
		{ id: 'gemini', label: 'Google-Extended' },
		{ id: 'perplexity', label: 'PerplexityBot' },
		{ id: 'bingbot', label: 'Bingbot' },
		{ id: 'applebot', label: 'Applebot-Extended' },
		{ id: 'ccbot', label: 'CCBot' },
	]

	const engineRows = [
		{ label: 'GPT-5', value: num(s.ai.citationByEngine.gpt5), tone: 'info' as const },
		{ label: 'Sonnet', value: num(s.ai.citationByEngine.sonnet), tone: 'info' as const },
		{ label: 'Gemini', value: num(s.ai.citationByEngine.gemini), tone: 'info' as const },
		{ label: 'Perplexity', value: num(s.ai.citationByEngine.perplexity), tone: 'info' as const },
		{ label: 'Bing AI', value: num(s.ai.citationByEngine.bing), tone: 'info' as const },
	]

	const hasCited = (s.ai.citedPages ?? []).length > 0
	const hasEntitySeg = (s.ai.entitySegments ?? []).length > 0
	const hasRichElig = (s.ai.richResultElig ?? []).length > 0
	const hasCompetitor = (s.ai.competitorOnlyCites ?? []).length > 0
	const hasMissed = (s.ai.missedPrompts ?? []).length > 0

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="AI readiness">
					<KpiRow>
						<KpiTile label="Readiness" value={fmtPct(s.ai.readiness)} tone={scoreToTone(s.ai.readiness)} />
						<KpiTile label="Schema cov" value={fmtPct(s.ai.schemaCoverage)} tone={scoreToTone(s.ai.schemaCoverage)} />
						<KpiTile label="Extractability" value={fmtPct(s.ai.extractability)} tone={scoreToTone(s.ai.extractability)} />
						<KpiTile label="Cited pages" value={compactNum((s.ai.citedPages ?? []).length)} tone="info" />
					</KpiRow>
				</Section>
			</Card>

			<Card>
				<Section title="AI files">
					<div className="flex flex-wrap gap-1.5">
						<FilePill label="llms.txt" on={!!s.ai.llmsTxt} />
						<FilePill label="llms-full.txt" on={!!s.ai.llmsFullTxt} />
						<FilePill label="ai.txt" on={!!s.ai.aiTxt} />
					</div>
				</Section>
			</Card>

			<ChecklistBlock
				title="Bots allowed"
				items={botList.map(b => ({
					id: b.id,
					label: b.label,
					state: s.ai.bots?.[b.id] === false ? 'fail' : s.ai.bots?.[b.id] === true ? 'pass' : 'skip',
				}))}
			/>

			<DistRowsBlock title="Citation by engine" rows={engineRows} />

			{s.hasPrior && (
				<TrendBlock title="Citations trend" values={s.ai.citationsSeries} tone="good" hint="Last 6 weeks" />
			)}

			{hasCited && (
				<TopListBlock
					title="Cited pages"
					items={s.ai.citedPages.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${compactNum(num(p.aiCitations))} cites`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			<DistRowsBlock
				title="Entity types"
				rows={[
					{ label: 'Person', value: s.ai.entities.person, tone: 'info' },
					{ label: 'Org', value: s.ai.entities.org, tone: 'info' },
					{ label: 'Place', value: s.ai.entities.place, tone: 'info' },
					{ label: 'Product', value: s.ai.entities.product, tone: 'good' },
				]}
			/>

			{hasEntitySeg && (
				<SegmentBlock
					title="Entities by segment"
					headers={['Segment', 'Pages', 'Schema', 'Citations']}
					rows={s.ai.entitySegments.slice(0, 6).map((e: any) => ({
						id: e.id, label: e.label, values: [num(e.pages), num(e.schema), num(e.citations)],
					}))}
				/>
			)}

			{hasRichElig && (
				<SegmentBlock
					title="Rich result eligibility"
					headers={['Type', 'Eligible', 'Pages']}
					rows={s.ai.richResultElig.slice(0, 6).map((r: any) => ({
						id: r.type, label: r.type, values: [num(r.eligible), num(r.pages)],
					}))}
				/>
			)}

			<Card>
				<Section title="Answer engines">
					<KpiRow>
						<KpiTile label="Answer-box fit" value={fmtPct(s.ai.answerBoxFit)} tone={scoreToTone(s.ai.answerBoxFit)} />
						<KpiTile label="Q&A schema" value={compactNum((s.ai.entitySegments ?? []).reduce((a: number, e: any) => a + (e.qa ?? 0), 0))} />
					</KpiRow>
				</Section>
			</Card>

			{hasCompetitor && (
				<TopListBlock
					title="Competitor-only citations"
					items={s.ai.competitorOnlyCites.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: (p.competitorEngines ?? []).join(' · '),
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{hasMissed && (
				<TopListBlock
					title="Missed prompts"
					items={s.ai.missedPrompts.slice(0, 6).map((m: any) => ({
						id: m.id || m.prompt, primary: m.prompt || m.label, tail: m.engine || '',
					}))}
				/>
			)}
		</div>
	)
}
