import type { CrawledPage } from '@/services/CrawlDatabase'
import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/ai/OverviewTab'
import { CrawlabilityTab } from '../../components/seo-crawler/right-sidebar/modes/ai/CrawlabilityTab'
import { CitationsTab } from '../../components/seo-crawler/right-sidebar/modes/ai/CitationsTab'
import { EntitiesTab } from '../../components/seo-crawler/right-sidebar/modes/ai/EntitiesTab'
import { SchemaTab } from '../../components/seo-crawler/right-sidebar/modes/ai/SchemaTab'

export interface AiStats {
	aiReadinessScore: number
	llmAllowed: { gptbot: boolean; claudebot: boolean; google_extended: boolean; perplexitybot: boolean; ccbot: boolean }
	llmTxtPresent: boolean
	cleanMarkupRate: number
	citationsByEngine: Array<{ engine: string; count: number }>
	topCitedPages: Array<{ url: string; engine: string; count: number }>
	topEntities: Array<{ name: string; type: string; pages: number; salience: number }>
	knowledgeGraphCoverage: number
	schemaCoverage: number
	jsonLdRate: number
	faqSchemaRate: number
	howToSchemaRate: number
}

export function computeAiStats({ pages }: RsDataDeps): AiStats {
	const total = pages.length || 1
	const sum = (pred: (p: CrawledPage) => boolean) => pages.filter(pred as any).length
	const hasSchema = (kind: string) => sum(p => ((p as any).schemaTypes ?? []).includes(kind))

	const engineMap = new Map<string, number>()
	const citedRows: Array<{ url: string; engine: string; count: number }> = []
	for (const p of pages) {
		for (const c of (p as any).aiCitations ?? []) {
			engineMap.set(c.engine, (engineMap.get(c.engine) ?? 0) + (c.count ?? 1))
			citedRows.push({ url: (p as any).url, engine: c.engine, count: c.count ?? 1 })
		}
	}

	const entMap = new Map<string, { type: string; pages: Set<string>; sal: number; n: number }>()
	for (const p of pages) {
		for (const e of (p as any).entities ?? []) {
			const k = `${e.type}|${e.name}`
			const entry = entMap.get(k) ?? { type: e.type, pages: new Set(), sal: 0, n: 0 }
			entry.pages.add((p as any).url)
			entry.sal += e.salience ?? 0
			entry.n += 1
			entMap.set(k, entry)
		}
	}

	return {
		aiReadinessScore: avg(pages, p => (p as any).aiReadinessScore),
		llmAllowed: {
			gptbot: (pages[0] as any)?.llmAllowed?.gptbot ?? false,
			claudebot: (pages[0] as any)?.llmAllowed?.claudebot ?? false,
			google_extended: (pages[0] as any)?.llmAllowed?.google_extended ?? false,
			perplexitybot: (pages[0] as any)?.llmAllowed?.perplexitybot ?? false,
			ccbot: (pages[0] as any)?.llmAllowed?.ccbot ?? false,
		},
		llmTxtPresent: (pages[0] as any)?.llmTxtPresent ?? false,
		cleanMarkupRate: sum(p => ((p as any).aiNoiseScore ?? 0) < 30) / total,
		citationsByEngine: [...engineMap.entries()].map(([engine, count]) => ({ engine, count })).sort((a, b) => b.count - a.count),
		topCitedPages: citedRows.sort((a, b) => b.count - a.count).slice(0, 5),
		topEntities: [...entMap.entries()]
			.map(([k, v]) => ({ name: k.split('|')[1], type: v.type, pages: v.pages.size, salience: v.sal / Math.max(1, v.n) }))
			.sort((a, b) => b.pages - a.pages)
			.slice(0, 6),
		knowledgeGraphCoverage: sum(p => (p as any).kgEntityFound === true) / total,
		schemaCoverage: sum(p => ((p as any).schemaTypes?.length ?? 0) > 0) / total,
		jsonLdRate: sum(p => (p as any).hasJsonLd === true) / total,
		faqSchemaRate: hasSchema('FAQPage') / total,
		howToSchemaRate: hasSchema('HowTo') / total,
	}
}

function avg(pages: ReadonlyArray<CrawledPage>, sel: (p: CrawledPage) => number | undefined) {
	const v = pages.map(sel as any).filter((x): x is number => typeof x === 'number')
	return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
}

export const aiBundle: RsModeBundle<AiStats> = {
	modeId: 'ai',
	computeStats: computeAiStats,
	tabs: {
		ai_overview: OverviewTab,
		ai_crawlability: CrawlabilityTab,
		ai_citations: CitationsTab,
		ai_entities: EntitiesTab,
		ai_schema: SchemaTab,
	},
}
