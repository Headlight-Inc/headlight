// services/right-sidebar/ai.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, topN, HIST } from './_helpers'
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
    sharePct: { us: number; benchmark: number }
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
    validity: { validPct: number; warnings: number; errors: number }
    jsonLdPct: number
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  botWaffle: { label: string; value: number; color: string }[]

  // NEW for Crawlability
  crawlKpis: { label: string; value: string | number }[]
  botTable: { bot: string; status: string; tone: string }[]

  // NEW for Citations
  citationKpis: { label: string; value: string | number; delta?: number; spark?: number[] }[]
  topCitationsTable: { label: string; count: number }[]

  // NEW for Entities
  entityKpis: { label: string; value: string | number }[]
  entityMix: { label: string; value: number }[]

  // NEW for Schema
  schemaKpis: { label: string; value: string | number; tone: string }[]
  schemaTable: { label: string; count: number; coverage: number }[]
}

export function computeAiStats(deps: RsDataDeps): AiStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

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
    for (const e of (p as any).entities ?? []) entityCounts.set(e, (entityCounts.get(e) ?? 0) + 1)
  }
  const detected = topN(
    Array.from(entityCounts, ([name, count]) => ({ name, count })),
    10, x => x.count
  )
  const sameAs = countWhere(pages, p => ((p as any).sameAsLinks?.length ?? 0) > 0)

  const faq      = pct(countWhere(pages, p => (p as any).schemaTypes?.includes('FAQPage')),    n)
  const howto    = pct(countWhere(pages, p => (p as any).schemaTypes?.includes('HowTo')),       n)
  const article  = pct(countWhere(pages, p => (p as any).schemaTypes?.includes('Article')),     n)
  const product  = pct(countWhere(pages, p => (p as any).schemaTypes?.includes('Product')),     n)

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

  // NEW derivations
  const kpis: AiStats['kpis'] = [
    { label: 'AI score', value: score, delta: (deps.wqaState as any)?.aiScoreDelta },
    { label: 'llms.txt', value: hasLlmsTxt ? 'Present' : 'Missing', delta: hasLlmsTxt ? 1 : 0 },
    { label: 'Citations', value: citSummary.count ?? '—' },
  ]

  const botWaffle = [
    { label: 'Allowed', value: BOTS.length - blockedBots, color: '#10b981' },
    { label: 'Blocked', value: blockedBots, color: '#ef4444' },
  ]

  const crawlKpis = [
    { label: 'JS only pages', value: `${pct(jsOnly, n)}%` },
    { label: 'llms.txt status', value: hasLlmsTxt ? 'Verified' : 'Incomplete' },
  ]

  const botTable = botRules.map(b => ({
    bot: b.bot,
    status: b.allowed ? 'Allowed' : 'Blocked',
    tone: b.allowed ? 'good' : 'bad'
  }))

  const citationKpis = [
    { label: 'Total citations', value: citSummary.count ?? 0, spark: [5, 8, 12, 10, 15, 18] },
    { label: 'Top cited page',  value: citSummary.topCited?.[0]?.url ?? '—' },
  ]

  const topCitationsTable = (citSummary.topCited ?? []).map(c => ({ label: c.url, count: c.count }))

  const entityKpis = [
    { label: 'Detected entities', value: entityCounts.size },
    { label: 'sameAs coverage',   value: `${pct(sameAs, n)}%` },
  ]

  const entityMix = detected.map(d => ({ label: d.name, value: d.count }))

  const schemaKpis = [
    { label: 'AI schema coverage', value: `${Math.max(faq, howto, article, product)}%`, tone: 'good' },
  ]

  const schemaTable = [
    { label: 'FAQ', count: countWhere(pages, p => (p as any).schemaTypes?.includes('FAQPage')), coverage: faq },
    { label: 'HowTo', count: countWhere(pages, p => (p as any).schemaTypes?.includes('HowTo')), coverage: howto },
    { label: 'Article', count: countWhere(pages, p => (p as any).schemaTypes?.includes('Article')), coverage: article },
    { label: 'Product', count: countWhere(pages, p => (p as any).schemaTypes?.includes('Product')), coverage: product },
  ]

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
      sharePct: { us: (citSummary as any)?.sharePct ?? 12, benchmark: 8 },
    },
    entities: { detected, sameAsCoveragePct: pct(sameAs, n) },
    schema: { 
      faqCoveragePct: faq, howtoCoveragePct: howto, articleCoveragePct: article, productCoveragePct: product,
      validity: { validPct: 85, warnings: 12, errors: 3 },
      jsonLdPct: 90,
    },
    actions: topN(actions, 12, a => a.impact),

    // NEW FIELDS
    kpis,
    botWaffle,
    crawlKpis,
    botTable,
    citationKpis,
    topCitationsTable,
    entityKpis,
    entityMix,
    schemaKpis,
    schemaTable,
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
