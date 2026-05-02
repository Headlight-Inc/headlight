import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, DistBlock, DistRowsBlock, TrendBlock,
	BenchmarkBlock, CompareBlock, ChecklistBlock,
	TopListBlock, SegmentBlock,
	EmptyState, compactNum, fmtPct, fmtMs, scoreToTone,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

export function FullAuditTech() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const total = s.total || 1
	const lcpPass = ((total - s.perf.lcpFail) / total) * 100
	const inpPass = ((total - s.perf.inpFail) / total) * 100
	const clsPass = ((total - s.perf.clsFail) / total) * 100
	const ttfbPass = ((total - s.perf.ttfbFail) / total) * 100

	const cwvByDevice = s.tech.cwvByDevice ?? { mobile: { lcpPass: 0, inpPass: 0, clsPass: 0 }, desktop: { lcpPass: 0, inpPass: 0, clsPass: 0 } }
	const imageOpt = s.tech.imageOpt ?? { webp: 0, lazy: 0, dimsMissing: 0, oversize: 0 }
	const hasImageOpt = imageOpt.webp + imageOpt.lazy + imageOpt.dimsMissing + imageOpt.oversize > 0
	const hasSchema = (s.tech.schemaCoverage ?? []).length > 0
	const hasLargest = (s.tech.largestPages ?? []).length > 0
	const hasSlowest = (s.tech.slowestPages ?? []).length > 0

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Tech health">
					<KpiRow>
						<KpiTile label="CWV pass" value={fmtPct(s.tech.cwvPass)} tone={scoreToTone(s.tech.cwvPass)} />
						<KpiTile label="Indexable" value={fmtPct(s.tech.indexable)} tone={scoreToTone(s.tech.indexable)} />
						<KpiTile label="HTTPS" value={fmtPct(s.tech.httpsCoverage)} tone={scoreToTone(s.tech.httpsCoverage)} />
						<KpiTile label="Mobile" value={fmtPct(s.tech.mobile)} tone={scoreToTone(s.tech.mobile)} />
					</KpiRow>
				</Section>
			</Card>

			<DistRowsBlock
				title="Core Web Vitals pass rates"
				rows={[
					{ label: `LCP · p50 ${fmtMs((s.tech.lcpP50 ?? 0) * 1000)}`, value: lcpPass, tone: scoreToTone(lcpPass) },
					{ label: `INP · p50 ${fmtMs(s.tech.inpP50)}`, value: inpPass, tone: scoreToTone(inpPass) },
					{ label: 'CLS', value: clsPass, tone: scoreToTone(clsPass) },
					{ label: `TTFB · p50 ${fmtMs(s.tech.ttfbP50)}`, value: ttfbPass, tone: scoreToTone(ttfbPass) },
				]}
			/>

			<SegmentBlock
				title="CWV by device"
				headers={['Device', 'LCP', 'INP', 'CLS']}
				rows={[
					{ id: 'mob', label: 'Mobile', values: [fmtPct(cwvByDevice.mobile.lcpPass), fmtPct(cwvByDevice.mobile.inpPass), fmtPct(cwvByDevice.mobile.clsPass)] },
					{ id: 'desk', label: 'Desktop', values: [fmtPct(cwvByDevice.desktop.lcpPass), fmtPct(cwvByDevice.desktop.inpPass), fmtPct(cwvByDevice.desktop.clsPass)] },
				]}
			/>

			<DistBlock
				title="Status codes"
				segments={[
					{ label: '2xx', value: s.status.ok, tone: 'good' },
					{ label: '3xx', value: s.status.redirect, tone: 'info' },
					{ label: '4xx', value: s.status.client, tone: 'bad' },
					{ label: '5xx', value: s.status.server, tone: 'bad' },
					{ label: 'Blocked', value: s.status.blocked, tone: 'warn' },
				]}
			/>

			<DistBlock
				title="HTTP version"
				segments={[
					{ label: 'h2', value: s.tech.http2, tone: 'good' },
					{ label: 'h3', value: s.tech.http3, tone: 'good' },
					{ label: 'h1.1', value: s.tech.http11, tone: 'warn' },
				]}
			/>

			<DistBlock
				title="Render path"
				segments={[
					{ label: 'Static', value: s.tech.renderStatic, tone: 'good' },
					{ label: 'SSR', value: s.tech.renderSsr, tone: 'info' },
					{ label: 'CSR', value: s.tech.renderCsr, tone: 'warn' },
				]}
			/>

			{hasSchema && (
				<SegmentBlock
					title="Schema coverage"
					headers={['Type', 'Pages', 'Cov']}
					rows={s.tech.schemaCoverage.slice(0, 8).map((r: any) => ({
						id: r.type, label: r.type,
						values: [num(r.pages), `${num(r.coverage).toFixed(0)}%`],
					}))}
				/>
			)}

			{hasImageOpt && (
				<Card>
					<Section title="Image optimisation">
						<KpiRow>
							<KpiTile label="WebP" value={imageOpt.webp} tone="good" />
							<KpiTile label="Lazy" value={imageOpt.lazy} tone="good" />
							<KpiTile label="Dims missing" value={imageOpt.dimsMissing} tone={imageOpt.dimsMissing > 0 ? 'warn' : 'good'} />
							<KpiTile label="Oversize" value={imageOpt.oversize} tone={imageOpt.oversize > 0 ? 'warn' : 'good'} />
						</KpiRow>
					</Section>
				</Card>
			)}

			{hasLargest && (
				<TopListBlock
					title="Largest pages"
					items={s.tech.largestPages.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${(num(p.bytes) / 1024).toFixed(0)} KB`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{hasSlowest && (
				<TopListBlock
					title="Slowest LCP pages"
					items={s.tech.slowestPages.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${(num(p.lcpMs) / 1000).toFixed(1)}s`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			<ChecklistBlock
				title="Security & infra"
				items={[
					{ id: 'hsts', label: 'HSTS enabled', state: s.tech.hstsMissing > 0 ? 'fail' : 'pass' },
					{ id: 'csp', label: 'CSP', state: s.tech.cspMissing > 0 ? 'warn' : 'pass' },
					{ id: 'tls', label: 'TLS valid', state: s.tech.sslInvalid > 0 ? 'fail' : 'pass' },
					{ id: 'mc', label: 'No mixed content', state: s.tech.mixedContent > 0 ? 'fail' : 'pass' },
					{ id: 'rdr', label: 'No deep redirect chains', state: s.tech.redirectChains > 0 ? 'warn' : 'pass' },
					{ id: 'idx', label: 'All HTML indexable', state: s.tech.noindex === 0 ? 'pass' : 'warn' },
					{ id: 'sm', label: 'Sitemap present', state: s.tech.sitemap?.found ? 'pass' : 'fail' },
					{ id: 'hl', label: 'No hreflang issues', state: (s.tech.hreflangIssues ?? 0) > 0 ? 'warn' : 'pass' },
				]}
			/>

			<Card>
				<Section title="Crawl health">
					<KpiRow>
						<KpiTile label="Budget waste" value={compactNum(s.tech.crawlBudgetWaste)} tone={s.tech.crawlBudgetWaste > 0 ? 'warn' : 'good'} />
						<KpiTile label="Canonical chains" value={s.tech.canonicalChains} tone={s.tech.canonicalChains > 0 ? 'warn' : 'good'} />
						<KpiTile label="Hreflang issues" value={s.tech.hreflangIssues ?? 0} tone={(s.tech.hreflangIssues ?? 0) > 0 ? 'warn' : 'good'} />
						<KpiTile label="Sitemap URLs" value={compactNum(s.tech.sitemap?.urls ?? 0)} hint={s.tech.sitemap?.found ? 'found' : 'missing'} tone={s.tech.sitemap?.found ? 'good' : 'bad'} />
					</KpiRow>
				</Section>
			</Card>

			<Card>
				<Section title="Accessibility">
					<KpiRow>
						<KpiTile label="A11y issues" value={s.tech.a11y?.issues ?? 0} tone={(s.tech.a11y?.issues ?? 0) > 0 ? 'warn' : 'good'} />
						<KpiTile label="Pages affected" value={s.tech.a11y?.pages ?? 0} />
					</KpiRow>
				</Section>
			</Card>

			<BenchmarkBlock title="CWV pass" site={s.tech.cwvPass} benchmark={s.bench.cwvPass} unit="%" higherIsBetter />

			{s.hasPrior && (
				<TrendBlock title="CWV trend" values={[s.tech.cwvPass]} tone={scoreToTone(s.tech.cwvPass)} hint="Pass rate over time" />
			)}

			{s.hasPrior && (
				<CompareBlock
					title="vs previous crawl"
					rows={[
						{ label: 'CWV pass', a: { v: s.tech.cwvPass, tag: 'now' }, b: { v: s.tech.cwvPassPrev, tag: 'prev' }, format: (v) => fmtPct(v) },
						{ label: 'Indexable', a: { v: s.tech.indexable, tag: 'now' }, b: { v: s.tech.indexablePrev, tag: 'prev' }, format: (v) => fmtPct(v) },
					]}
				/>
			)}
		</div>
	)
}
