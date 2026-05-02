import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	Card, Section, KpiRow, KpiTile, DistBlock, DistRowsBlock, TrendBlock,
	TopListBlock, CompareBlock,
	EmptyState, compactNum,
} from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

export function FullAuditLinks() {
	const { pages } = useSeoCrawler() as any
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl yet" />

	const anchorTotal = (s.links.anchorMix.brand ?? 0) + (s.links.anchorMix.exact ?? 0)
		+ (s.links.anchorMix.partial ?? 0) + (s.links.anchorMix.generic ?? 0)
		+ (s.links.anchorMix.naked ?? 0) + (s.links.anchorMix.image ?? 0)
	const pct = (n: number) => anchorTotal ? Math.round((n / anchorTotal) * 100) : 0

	const hasBacklinkChange = num(s.links.new90d) + num(s.links.lost90d) + num(s.links.toxic) > 0
	const hasTopRefDomains = (s.links.topRefDomains ?? []).length > 0
	const hasTopAnchors = (s.links.topAnchors ?? []).length > 0
	const hasOutlinks = (s.links.outlinksTopPages ?? []).length > 0
	const hasOverOpt = (s.links.anchorOverOpt ?? []).length > 0
	const hasToxicList = (s.links.toxicList ?? []).length > 0
	const hasLostList = (s.links.lostList ?? []).length > 0
	const hasPagerank = (s.links.pagerankHistogram ?? []).length > 0

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Internal">
					<KpiRow>
						<KpiTile label="Internal links" value={compactNum(s.links.internalLinks)} />
						<KpiTile label="External outlinks" value={compactNum(s.links.externalLinks)} />
						<KpiTile label="Orphans" value={s.links.orphans} tone={s.links.orphans > 0 ? 'warn' : 'neutral'} />
						<KpiTile label="Broken" value={s.links.broken} tone={s.links.broken > 0 ? 'bad' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			<Card>
				<Section title="External">
					<KpiRow>
						<KpiTile label="Ref domains" value={compactNum(s.links.refDomains)} />
						<KpiTile label="Backlinks" value={compactNum(s.links.totalBacklinks)} />
						<KpiTile label="Avg DR" value={s.links.avgDr} />
						<KpiTile label="Toxic" value={s.links.toxic} tone={s.links.toxic > 0 ? 'warn' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			{hasBacklinkChange && (
				<Card>
					<Section title="Backlink change (90d)">
						<KpiRow>
							<KpiTile label="New" value={`+${compactNum(s.links.new90d)}`} tone="good" />
							<KpiTile label="Lost" value={`-${compactNum(s.links.lost90d)}`} tone={s.links.lost90d > 0 ? 'warn' : 'neutral'} />
						</KpiRow>
					</Section>
				</Card>
			)}

			{s.hasPrior && (
				<TrendBlock title="Ref domains trend" values={s.links.refDomainsSeries} tone="good" hint="Last 6 months" />
			)}

			<DistRowsBlock
				title="Anchor distribution"
				rows={[
					{ label: 'Brand', value: pct(s.links.anchorMix.brand), tone: 'good' },
					{ label: 'Exact', value: pct(s.links.anchorMix.exact), tone: pct(s.links.anchorMix.exact) > 30 ? 'warn' : 'good' },
					{ label: 'Partial', value: pct(s.links.anchorMix.partial), tone: 'info' },
					{ label: 'Generic', value: pct(s.links.anchorMix.generic), tone: 'warn' },
					{ label: 'Naked URL', value: pct(s.links.anchorMix.naked), tone: 'info' },
					{ label: 'Image', value: pct(s.links.anchorMix.image), tone: 'neutral' },
				]}
			/>

			<DistBlock
				title="Follow type"
				segments={[
					{ label: 'dofollow', value: s.links.dofollow, tone: 'good' },
					{ label: 'nofollow', value: s.links.nofollow, tone: 'info' },
					{ label: 'UGC', value: s.links.ugc, tone: 'neutral' },
					{ label: 'sponsored', value: s.links.sponsored, tone: 'warn' },
				]}
			/>

			{hasTopRefDomains && (
				<TopListBlock
					title="Top referring domains"
					items={s.links.topRefDomains.slice(0, 6).map((d: any) => ({
						id: d.domain, primary: d.domain,
						tail: `DR ${d.dr || '—'} · ${compactNum(d.backlinks || 0)}`,
					}))}
				/>
			)}

			{hasTopAnchors && (
				<TopListBlock
					title="Top anchors"
					items={s.links.topAnchors.slice(0, 6).map((a: any) => ({
						id: a.anchor, primary: a.anchor, tail: compactNum(a.count || 0),
					}))}
				/>
			)}

			{s.links.hubs?.length > 0 && (
				<TopListBlock
					title="Top hubs by inlinks"
					items={s.links.hubs.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${compactNum(num(p.inlinks))} inlinks`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{hasOutlinks && (
				<TopListBlock
					title="Top outlink pages"
					items={s.links.outlinksTopPages.slice(0, 6).map((p: any) => ({
						id: p.url, primary: p.title || p.url, secondary: p.url,
						tail: `${compactNum(num(p.outlinks))} outlinks`,
						onClick: () => drill.toPage(p),
					}))}
				/>
			)}

			{hasOverOpt && (
				<TopListBlock
					title="Anchor over-optimisation"
					items={s.links.anchorOverOpt.slice(0, 6).map((r: any) => ({
						id: r.url, primary: r.url, secondary: `“${r.anchor}”`,
						tail: `${num(r.pct).toFixed(0)}%`,
						onClick: () => drill.toCategory('links', `over-opt:${r.url}`),
					}))}
				/>
			)}

			{hasToxicList && (
				<TopListBlock
					title="Toxic links"
					items={s.links.toxicList.slice(0, 6).map((t: any) => ({
						id: t.domain, primary: t.domain,
						tail: `score ${num(t.score).toFixed(0)} · ${compactNum(num(t.backlinks))}`,
					}))}
				/>
			)}

			{s.hasPrior && hasLostList && (
				<TopListBlock
					title="Lost backlinks"
					items={s.links.lostList.slice(0, 6).map((l: any) => ({
						id: l.domain, primary: l.domain, tail: l.date,
					}))}
				/>
			)}

			{hasPagerank && (
				<DistRowsBlock
					title="PageRank histogram"
					rows={s.links.pagerankHistogram.map((r: any) => ({ id: r.bucket, label: r.bucket, value: num(r.count), tone: 'info' }))}
				/>
			)}

			{s.hasPrior && (
				<CompareBlock
					title="vs previous crawl"
					rows={[
						{ label: 'Ref domains', a: { v: s.links.refDomains, tag: 'now' }, b: { v: s.links.refDomainsPrev, tag: 'prev' }, format: compactNum },
					]}
				/>
			)}
		</div>
	)
}
