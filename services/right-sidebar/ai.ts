import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { countWhere } from './utils'
import { AiOverviewTab, AiCrawlabilityTab, AiCitationsTab, AiEntitiesTab, AiSchemaTab } from '../../components/seo-crawler/right-sidebar/modes/ai'

export interface AiStats {
  overview: { aiReadiness: number; llmsTxt: 'present' | 'missing' | 'invalid'; ssML: number; jsonLdPages: number; openGraphPages: number; eeatScore: number | null }
  crawlability: { robots: ReadonlyArray<{ bot: string; allowed: boolean; rate?: number }>; jsRequired: number; clientRendered: number; staticHtml: number }
  citations: { totalCitations: number; uniqueDomains: number; topAnswerEngines: ReadonlyArray<{ engine: string; citations: number }>; sampleQueries: ReadonlyArray<{ query: string; citationsCount: number }> }
  entities: { count: number; topEntities: ReadonlyArray<{ name: string; type: string; mentions: number }>; sameAsCoverage: number }
  schema: { byType: ReadonlyArray<{ type: string; count: number }>; missingProductSchema: number; faqPages: number; howToPages: number; articlePages: number; brokenSchema: number }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeAiStats(deps: RsDataDeps): AiStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}
  const llms = conn.llmsTxt, brand = conn.brandtrack, perplex = conn.perplexity

  const jsRequired   = countWhere(pages, p => p?.requiresJavaScript === true)
  const clientRender = jsRequired
  const staticHtml   = n - jsRequired
  const jsonLdPages  = countWhere(pages, p => Number(p?.structuredDataItemCount ?? 0) > 0)
  const ogPages      = countWhere(pages, p => p?.ogTitle || p?.ogDescription)

  const robots = (conn.robots?.summary?.botRules ?? [
    { bot: 'Googlebot',     allowed: true,  rate: 1.0 },
    { bot: 'GPTBot',        allowed: false },
    { bot: 'ClaudeBot',     allowed: false },
    { bot: 'PerplexityBot', allowed: false },
    { bot: 'CCBot',         allowed: true,  rate: 0.5 },
  ]) as Array<{ bot: string; allowed: boolean; rate?: number }>

  const llmsState: AiStats['overview']['llmsTxt'] = !llms ? 'missing' : llms.invalid ? 'invalid' : 'present'
  const eeat = (countWhere(pages, p => p?.author) + countWhere(pages, p => p?.aboutPageLinked) + countWhere(pages, p => p?.contactPageLinked)) / Math.max(1, 3 * n)
  const aiReadiness = Math.round(
    100 * (
      0.25 * (llmsState === 'present' ? 1 : 0)
    + 0.25 * (jsonLdPages / n)
    + 0.20 * (staticHtml / n)
    + 0.15 * (robots.filter(b => /GPTBot|Claude|Perplexity/.test(b.bot)).every(b => b.allowed) ? 1 : 0.5)
    + 0.15 * eeat
    )
  )

  const byType = collectSchema(pages)
  const missingProductSchema = countWhere(pages, p =>
    Array.isArray(p?.schemaTypes) && p.schemaTypes.includes('Offer') && !p.schemaTypes.includes('Product'))
  const faqPages     = countWhere(pages, p => Array.isArray(p?.schemaTypes) && p.schemaTypes.includes('FAQPage'))
  const howToPages   = countWhere(pages, p => Array.isArray(p?.schemaTypes) && p.schemaTypes.includes('HowTo'))
  const articlePages = countWhere(pages, p => Array.isArray(p?.schemaTypes) && p.schemaTypes.some((t: string) => /Article/.test(t)))
  const brokenSchema = countWhere(pages, p => Number(p?.structuredDataErrors ?? 0) > 0)

  const actions: RsAction[] = []
  if (llmsState !== 'present')         actions.push({ id: 'llms',  label: 'Add /llms.txt manifest',           severity: 'highLeverage', effort: 'low', impact: 70 })
  if (jsonLdPages / n < 0.5)           actions.push({ id: 'jsonld', label: 'Add JSON-LD to remaining pages',  severity: 'highLeverage', effort: 'med', impact: 65 })
  if (jsRequired / n > 0.5)            actions.push({ id: 'ssr',   label: 'SSR critical pages for AI bots',   severity: 'strategic',    effort: 'high', impact: 60 })
  if (robots.some(b => /GPTBot|Claude|Perplexity/.test(b.bot) && !b.allowed)) {
    actions.push({ id: 'allow', label: 'Decide which AI bots to allow', severity: 'strategic', effort: 'low', impact: 40 })
  }

  return {
    overview: { aiReadiness, llmsTxt: llmsState, ssML: 0, jsonLdPages, openGraphPages: ogPages, eeatScore: Math.round(eeat * 100) },
    crawlability: { robots, jsRequired, clientRendered: clientRender, staticHtml },
    citations: {
      totalCitations:   brand?.summary?.totalCitations ?? 0,
      uniqueDomains:    brand?.summary?.uniqueDomains  ?? 0,
      topAnswerEngines: brand?.summary?.topAnswerEngines ?? [],
      sampleQueries:    brand?.summary?.sampleQueries    ?? perplex?.summary?.sampleQueries ?? [],
    },
    entities: {
      count:           brand?.summary?.entityCount ?? 0,
      topEntities:     brand?.summary?.topEntities ?? [],
      sameAsCoverage:  countWhere(pages, p => Array.isArray(p?.sameAsLinks) && p.sameAsLinks.length > 0),
    },
    schema: {
      byType, missingProductSchema, faqPages, howToPages, articlePages, brokenSchema,
    },
    actions,
    fetchedAt: (llms ?? brand ?? perplex)?.lastFetchedAt,
  }
}
function collectSchema(pages: ReadonlyArray<any>): { type: string; count: number }[] {
  const m = new Map<string, number>()
  for (const p of pages) for (const t of (p?.schemaTypes ?? [])) m.set(t, (m.get(t) ?? 0) + 1)
  return Array.from(m, ([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 10)
}

export const aiBundle: RsModeBundle<AiStats> = {
  mode: 'ai', accent: 'fuchsia', defaultTabId: 'ai_overview',
  tabs: [
    { id: 'ai_overview',     label: 'Overview',     Component: AiOverviewTab },
    { id: 'ai_crawlability', label: 'Crawlability', Component: AiCrawlabilityTab },
    { id: 'ai_citations',    label: 'Citations',    Component: AiCitationsTab },
    { id: 'ai_entities',     label: 'Entities',     Component: AiEntitiesTab },
    { id: 'ai_schema',       label: 'Schema',       Component: AiSchemaTab },
  ],
  computeStats: computeAiStats,
}
