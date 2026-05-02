import React from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { useFullAuditInsights } from '../_hooks/useFullAuditInsights'
import { useDrill } from '../_shared/drill'
import {
	DistBlock, DistRowsBlock, TrendBlock, TopListBlock, SegmentBlock,
	CompareBlock, DrillFooter, EmptyState, KpiRow, KpiTile, Card, Section,
	compactNum, fmtPct,
} from '../_shared'

export function FullAuditLinks() {
	const { pages } = useSeoCrawler()
	const s = useFullAuditInsights()
	const drill = useDrill()

	if (!pages?.length) return <EmptyState title="No crawl data yet" />

	const anchorTotal = (s.links.anchorMix.brand || 0) + (s.links.anchorMix.exact || 0) + (s.links.anchorMix.partial || 0) + (s.links.anchorMix.generic || 0) + (s.links.anchorMix.naked || 0) + (s.links.anchorMix.image || 0)

	return (
		<div className="flex flex-col gap-3 p-3">
			<Card>
				<Section title="Internal links" dense>
					<KpiRow>
						<KpiTile label="Total internal" value={compactNum(s.links.internalLinks)} />
						<KpiTile label="External" value={compactNum(s.links.externalLinks)} />
						<KpiTile label="Orphans" value={compactNum(s.links.orphans)} tone={s.links.orphans > 0 ? 'warn' : 'neutral'} />
						<KpiTile label="Broken" value={compactNum(s.links.broken)} tone={s.links.broken > 0 ? 'bad' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			<Card>
				<Section title="Backlinks" dense>
					<KpiRow>
						<KpiTile label="Ref domains" value={compactNum(s.links.refDomains)} />
						<KpiTile label="Total backlinks" value={compactNum(s.links.totalBacklinks)} />
						<KpiTile label="Avg DR" value={s.links.avgDr ? s.links.avgDr.toFixed(0) : '—'} />
						<KpiTile label="Toxic" value={compactNum(s.links.toxic)} tone={s.links.toxic > 0 ? 'warn' : 'neutral'} />
					</KpiRow>
				</Section>
			</Card>

			<TrendBlock title="Ref domains (12 weeks)" values={s.links.refDomainsSeries} tone="info" />

			<DistBlock title="Follow mix" segments={[
				{ value: s.links.dofollow, tone: 'good', label: 'dofollow' },
				{ value: s.links.nofollow, tone: 'info', label: 'nofollow' },
				{ value: s.links.ugc, tone: 'neutral', label: 'ugc' },
				{ value: s.links.sponsored, tone: 'warn', label: 'sponsored' },
			]} />

			<DistRowsBlock title="Anchor mix" rows={[
				{ label: 'Brand', value: anchorTotal ? Math.round((s.links.anchorMix.brand / anchorTotal) * 100) : 0, tone: 'good' },
				{ label: 'Exact', value: anchorTotal ? Math.round((s.links.anchorMix.exact / anchorTotal) * 100) : 0, tone: s.links.anchorMix.exact / Math.max(1, anchorTotal) > 0.3 ? 'warn' : 'good' },
				{ label: 'Partial', value: anchorTotal ? Math.round((s.links.anchorMix.partial / anchorTotal) * 100) : 0, tone: 'info' },
				{ label: 'Generic', value: anchorTotal ? Math.round((s.links.anchorMix.generic / anchorTotal) * 100) : 0, tone: 'warn' },
				{ label: 'Naked URL', value: anchorTotal ? Math.round((s.links.anchorMix.naked / anchorTotal) * 100) : 0, tone: 'info' },
				{ label: 'Image', value: anchorTotal ? Math.round((s.links.anchorMix.image / anchorTotal) * 100) : 0, tone: 'neutral' },
			]} />

			<DistBlock title="New vs lost (90 days)" segments={[
				{ value: s.links.new90d, tone: 'good', label: 'New' },
				{ value: s.links.lost90d, tone: 'bad', label: 'Lost' },
			]} />

			<TopListBlock
				title="Top referring domains"
				items={s.links.topRefDomains.slice(0, 8).map((d: any) => ({
					id: d.domain, primary: d.domain, tail: `DR ${d.dr || '—'} · ${compactNum(d.backlinks || 0)}`,
				}))}
				emptyText="No backlink data"
			/>

			<TopListBlock
				title="Top anchors"
				items={s.links.topAnchors.slice(0, 8).map((a: any) => ({
					id: a.anchor, primary: a.anchor, tail: compactNum(a.count || 0),
				}))}
				emptyText="No anchor data"
			/>

			<TopListBlock
				title="Internal hubs"
				items={s.links.hubs.map((p: any) => ({
					id: p.url, primary: p.title || p.url, secondary: p.url,
					tail: `${compactNum(Number(p.inlinks))} inlinks`,
					onClick: () => drill.toPage(p),
				}))}
			/>

			<CompareBlock title="This crawl vs last" rows={[
				{ label: 'Ref domains', a: { v: s.links.refDomains, tag: 'now' }, b: { v: s.links.refDomainsPrev, tag: 'prev' }, format: compactNum },
				{ label: 'Orphans', a: { v: s.links.orphans, tag: 'now' }, b: { v: 0, tag: 'prev' } },
			]} />

			<DrillFooter chips={[
				{ label: 'Orphans', count: s.links.orphans, onClick: () => drill.toCategory('links', 'Orphan Pages') },
				{ label: 'Broken', count: s.links.broken, onClick: () => drill.toCategory('links', 'Broken Internal') },
				{ label: 'Toxic', count: s.links.toxic },
				{ label: 'New 90d', count: s.links.new90d },
			]} />
		</div>
	)
}
