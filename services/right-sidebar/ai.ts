// services/right-sidebar/ai.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN } from './_helpers'
import {
  AiOverviewTab, AiCrawlabilityTab, AiCitationsTab, AiEntitiesTab, AiSchemaTab,
} from '../../components/seo-crawler/right-sidebar/modes/ai'

const BOTS = ['GPTBot','ClaudeBot','Google-Extended','CCBot','PerplexityBot'] as const

export interface AiStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  crawlability: {
    hasLlmsTxt: boolean
    llmsTxtParsedAt?: number
    botRules: { bot: 'GPTBot'|'ClaudeBot'|'Google-Extended'|'CCBot'|'PerplexityBot'; allowed: boolean }[]
    jsOnlyPagesPct: number
    structuredOnlyPagesPct: number
  }
  citations: {
    source: 'perplexity'|'bing'|'sge'|'none'
    citationsCount: number | null
    topCitedPages: { url: string; count: number }[]
    fetchedAt?: number
  }
  entities: {
    detected: { name: string; count: number }[]
    sameAsCoveragePct: number
  }
  schema: {
    faqCoveragePct: number
    howtoCoveragePct: number
    articleCoveragePct: number
    productCoveragePct: number
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
}

export function computeAiStats(deps: RsDataDeps): AiStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  const llms = conn.llmsTxt
  const hasLlmsTxt = !!llms
  const robotsSummary = (conn.robots?.summary ?? {}) as { allowedBots?: string[]; disallowedBots?: string[] }
  const botRules = BOTS.map(b => ({ bot: b, allowed: !robotsSummary.disallowedBots?.includes(b) })) as AiStats['crawlability']['botRules']

  const jsOnly      = countWhere(pages, p => !!p.requiresJavaScript)
  const structOnly  = countWhere(pages, p => (p.schemaTypes?.length ?? 0) > 0 && (p.wordCount ?? 0) < 100)

  const cit = conn.perplexity ?? conn.bing ?? conn.sge
  const citSource: AiStats['citations']['source'] =
    conn.perplexity ? 'perplexity' : conn.bing ? 'bing' : conn.sge ? 'sge' : 'none'
  const citSummary = (cit?.summary ?? {}) as { count?: number; topCited?: { url: string; count: number }[] }

  const entityCounts = new Map<string, number>()
  for (const p of pages) {
    for (const e of p.entities ?? []) entityCounts.set(e, (entityCounts.get(e) ?? 0) + 1)
  }
  const detected = topN(
    Array.from(entityCounts, ([name, count]) => ({ name, count })),
    10, x => x.count
  )
  const sameAs = countWhere(pages, p => (p.sameAsLinks?.length ?? 0) > 0)

  const faq      = pct(countWhere(pages, p => p.schemaTypes?.includes('FAQPage')),    n)
  const howto    = pct(countWhere(pages, p => p.schemaTypes?.includes('HowTo')),       n)
  const article  = pct(countWhere(pages, p => p.schemaTypes?.includes('Article')),     n)
  const product  = pct(countWhere(pages, p => p.schemaTypes?.includes('Product')),     n)

  const blockedBots = botRules.filter(b => !b.allowed).length
  const score = Math.round(
    0.30 * (hasLlmsTxt ? 100 : 30) +
    0.20 * Math.max(0, 100 - blockedBots * 20) +
    0.20 * (100 - pct(jsOnly, n)) +
    0.15 * pct(sameAs, n) +
    0.15 * Math.max(faq, howto, article)
  )

  const actions: AiStats['actions'] = [
    { id: 'add-llmstxt',  label: hasLlmsTxt ? 'Refine llms.txt' : 'Add /llms.txt', effort: 'low', impact: hasLlmsTxt ? 0 : 50 },
    { id: 'unblock-bots', label: `Unblock ${blockedBots} AI bots in robots.txt`,  effort: 'low', impact: blockedBots * 10 },
    { id: 'fix-jsonly',   label: `Render ${jsOnly} JS-only pages server-side`,    effort: 'high', impact: jsOnly },
    { id: 'add-entities', label: `Add sameAs to ${n - sameAs} pages`,             effort: 'medium', impact: n - sameAs },
  ].filter(a => a.impact > 0)

  return {
    overall: {
      score,
      chips: [
        { label: 'llms.txt',  value: hasLlmsTxt ? 'on' : 'off',     tone: hasLlmsTxt ? 'good' : 'bad' },
        { label: 'JS-only',   value: `${pct(jsOnly, n)}%`,           tone: pct(jsOnly, n) < 20 ? 'good' : 'warn' },
        { label: 'Bots open', value: `${BOTS.length - blockedBots}/${BOTS.length}`, tone: blockedBots === 0 ? 'good' : 'warn' },
        { label: 'sameAs',    value: `${pct(sameAs, n)}%`,           tone: pct(sameAs, n) >= 50 ? 'good' : 'warn' },
      ],
    },
    crawlability: {
      hasLlmsTxt,
      llmsTxtParsedAt: llms?.lastFetchedAt as number | undefined,
      botRules,
      jsOnlyPagesPct: pct(jsOnly, n),
      structuredOnlyPagesPct: pct(structOnly, n),
    },
    citations: {
      source: citSource,
      citationsCount: citSummary.count ?? null,
      topCitedPages: citSummary.topCited ?? [],
      fetchedAt: cit?.lastFetchedAt as number | undefined,
    },
    entities: { detected, sameAsCoveragePct: pct(sameAs, n) },
    schema: { faqCoveragePct: faq, howtoCoveragePct: howto, articleCoveragePct: article, productCoveragePct: product },
    actions: topN(actions, 12, a => a.impact),
  }
}

export const aiBundle: RsModeBundle<AiStats> = {
  mode: 'ai',
  accent: 'fuchsia',
  defaultTabId: 'ai_overview',
  tabs: [
    { id: 'ai_overview',     label: 'Overview',     Component: AiOverviewTab },
    { id: 'ai_crawlability', label: 'Crawlability', Component: AiCrawlabilityTab },
    { id: 'ai_citations',    label: 'Citations',    Component: AiCitationsTab },
    { id: 'ai_entities',     label: 'Entities',     Component: AiEntitiesTab },
    { id: 'ai_schema',       label: 'Schema',       Component: AiSchemaTab },
  ],
  computeStats: computeAiStats,
}
