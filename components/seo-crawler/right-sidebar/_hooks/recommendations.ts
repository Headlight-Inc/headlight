import type { RecommendedAction } from '../_shared'

function num(v: any) { return Number.isFinite(Number(v)) ? Number(v) : 0 }

type Rule = {
	id: string
	priority: RecommendedAction['priority']
	category: string
	effortMin: number
	confidence: number
	test: (p: any) => boolean
	build: (matches: any[]) => Pick<RecommendedAction, 'title' | 'subtitle' | 'expectedDelta'>
}

const RULES: Rule[] = [
	{
		id: 'fix-5xx', priority: 'critical', category: 'Tech', effortMin: 30, confidence: 0.95,
		test: p => num(p.statusCode) >= 500,
		build: m => ({ title: 'Fix 5xx server errors', subtitle: `${m.length} pages`, expectedDelta: { value: Math.min(8, m.length * 0.5), unit: 'pts' } }),
	},
	{
		id: 'fix-4xx-with-traffic', priority: 'high', category: 'Tech', effortMin: 20, confidence: 0.9,
		test: p => num(p.statusCode) >= 400 && num(p.statusCode) < 500 && num(p.gscClicks) > 0,
		build: m => ({ title: 'Fix 4xx pages with traffic', subtitle: `${m.length} pages`, expectedDelta: { value: Math.round(m.reduce((a, p) => a + num(p.gscClicks), 0) * 0.6), unit: '/mo' } }),
	},
	{
		id: 'reclaim-noindex', priority: 'high', category: 'Indexability', effortMin: 15, confidence: 0.85,
		test: p => p.indexable === false && num(p.gscImpressions) > 0,
		build: m => ({ title: 'Reclaim noindex pages with impressions', subtitle: `${m.length} pages`, expectedDelta: { value: Math.round(m.reduce((a, p) => a + num(p.gscImpressions) * 0.04, 0)), unit: '/mo' } }),
	},
	{
		id: 'striking-distance', priority: 'high', category: 'Search', effortMin: 60, confidence: 0.7,
		test: p => num(p.gscPosition) > 10 && num(p.gscPosition) <= 20 && num(p.gscImpressions) > 100,
		build: m => ({ title: 'Push striking-distance pages to top 10', subtitle: `${m.length} pages`, expectedDelta: { value: Math.round(m.reduce((a, p) => a + num(p.gscImpressions) * 0.05, 0)), unit: '/mo' } }),
	},
	{
		id: 'low-ctr-page1', priority: 'med', category: 'Search', effortMin: 30, confidence: 0.65,
		test: p => num(p.gscPosition) > 0 && num(p.gscPosition) <= 10 && num(p.gscCtr) > 0 && num(p.gscCtr) < 0.02,
		build: m => ({ title: 'Rewrite titles + meta on low-CTR page-1 results', subtitle: `${m.length} pages`, expectedDelta: { value: Math.round(m.reduce((a, p) => a + num(p.gscImpressions) * 0.015, 0)), unit: '/mo' } }),
	},
	{
		id: 'lcp-fail', priority: 'med', category: 'Performance', effortMin: 120, confidence: 0.6,
		test: p => num(p.lcpMs) > 2500,
		build: m => ({ title: 'Improve LCP on slow pages', subtitle: `${m.length} pages`, expectedDelta: { value: Math.min(6, m.length * 0.2), unit: 'pts' } }),
	},
	{
		id: 'orphans', priority: 'med', category: 'Links', effortMin: 30, confidence: 0.7,
		test: p => num(p.inlinks) === 0 && num(p.crawlDepth) > 0,
		build: m => ({ title: 'Add internal links to orphan pages', subtitle: `${m.length} pages`, expectedDelta: { value: Math.min(4, m.length * 0.15), unit: 'pts' } }),
	},
	{
		id: 'broken-internal', priority: 'med', category: 'Links', effortMin: 20, confidence: 0.85,
		test: p => num(p.brokenInternalLinks) > 0,
		build: m => ({ title: 'Fix broken internal links', subtitle: `${m.reduce((a, p) => a + num(p.brokenInternalLinks), 0)} links across ${m.length} pages`, expectedDelta: { value: 3, unit: 'pts' } }),
	},
	{
		id: 'thin-content', priority: 'low', category: 'Content', effortMin: 90, confidence: 0.55,
		test: p => num(p.wordCount) > 0 && num(p.wordCount) < 300,
		build: m => ({ title: 'Expand thin content', subtitle: `${m.length} pages under 300 words`, expectedDelta: { value: 2, unit: 'pts' } }),
	},
	{
		id: 'missing-meta', priority: 'low', category: 'Content', effortMin: 5, confidence: 0.95,
		test: p => !String(p.metaDesc || '').trim(),
		build: m => ({ title: 'Write missing meta descriptions', subtitle: `${m.length} pages`, expectedDelta: { value: 1, unit: 'pts' } }),
	},
	{
		id: 'missing-alt', priority: 'low', category: 'A11y', effortMin: 5, confidence: 0.9,
		test: p => num(p.missingAltImages) > 0,
		build: m => ({ title: 'Add alt text to images', subtitle: `${m.reduce((a, p) => a + num(p.missingAltImages), 0)} images across ${m.length} pages`, expectedDelta: { value: 1, unit: 'pts' } }),
	},
	{
		id: 'block-ai-bots', priority: 'low', category: 'AI', effortMin: 10, confidence: 0.8,
		test: () => false, // site-level rule, computed elsewhere
		build: () => ({ title: 'Allow AI crawlers in robots.txt', expectedDelta: { value: 2, unit: 'pts' } }),
	},
]

const EFFORT_W: Record<RecommendedAction['priority'], number> = { critical: 1, high: 1.2, med: 1.5, low: 2 }

export function computeRecommendations(pages: any[]): RecommendedAction[] {
	const out: RecommendedAction[] = []
	for (const rule of RULES) {
		const matches = pages.filter(rule.test)
		if (matches.length === 0) continue
		const built = rule.build(matches)
		out.push({
			id: rule.id,
			priority: rule.priority,
			category: rule.category,
			effortMin: rule.effortMin,
			confidence: rule.confidence,
			pagesAffected: matches.length,
			onClick: undefined,
			...built,
		})
	}
	return out.sort((a, b) => {
		const sa = (a.expectedDelta.value * a.confidence) / (a.effortMin * EFFORT_W[a.priority])
		const sb = (b.expectedDelta.value * b.confidence) / (b.effortMin * EFFORT_W[b.priority])
		return sb - sa
	})
}
