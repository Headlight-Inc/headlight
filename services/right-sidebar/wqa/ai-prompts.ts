import type { WqaSiteStats } from '../../WebsiteQualityModeTypes'
import type { ActionGroup, WqaForecast } from './types'

export interface OverviewPromptInput {
  domain: string
  industry: string
  language: string
  cms: string | null
  score: number
  grade: string
  stats: WqaSiteStats
}

export function buildOverviewInsightPrompt(i: OverviewPromptInput): string {
  return [
    'You are a senior SEO analyst writing for the right-sidebar Overview tab in Headlight.',
    'Audience: the site owner. Tone: precise, specific, no fluff.',
    `Site: ${i.domain} (industry=${i.industry}, lang=${i.language}, cms=${i.cms || 'unknown'})`,
    `Quality score: ${i.score}/100 (${i.grade})`,
    `Pages: ${i.stats.totalPages}; Indexable: ${i.stats.indexedPages}; Sitemap coverage: ${(i.stats.sitemapCoverage*100).toFixed(0)}%; Schema coverage: ${(i.stats.schemaCoverage*100).toFixed(0)}%`,
    `Avg position: ${i.stats.avgPosition.toFixed(1)}; Avg CTR: ${(i.stats.avgCtr*100).toFixed(2)}%; Total clicks (30d): ${i.stats.totalClicks}; Total impressions: ${i.stats.totalImpressions}`,
    `Risks: losing-traffic=${i.stats.pagesLosingTraffic}, zero-impressions=${i.stats.pagesWithZeroImpressions}, cannibalization=${i.stats.cannibalizationCount}, decay-risk=${i.stats.decayRiskCount}`,
    '',
    'Output exactly 3 bullets, each ≤ 18 words.',
    'Bullet 1: the single most material problem.',
    'Bullet 2: the single biggest opportunity.',
    'Bullet 3: the next concrete step (one sentence imperative).',
    'Do not invent numbers. Reference the values above only.',
  ].join('\n')
}

export function buildActionsForecastPrompt(
  groups: ActionGroup[],
  forecast: WqaForecast,
): string {
  const top = groups.slice(0, 8).map(g =>
    `- ${g.code} ${g.action} (${g.category}, P${Math.round(g.avgPriority)}, ${g.pageCount} pages, est. impact ${Math.round(g.totalEstimatedImpact)})`,
  ).join('\n')
  return [
    'You are forecasting the SEO impact of a candidate action plan.',
    `Current site quality score: ${forecast.currentScore}/100`,
    `Projected score after all P0+P1: ${forecast.projectedScore}/100 (confidence ${forecast.confidence}%)`,
    `Estimated incremental clicks/mo: ${forecast.estimatedClickGain}`,
    `Breakdown gain — technical: ${forecast.breakdown.technical}, content: ${forecast.breakdown.content}, authority: ${forecast.breakdown.authority}`,
    'Top action groups:',
    top || '(none)',
    '',
    'Output exactly 2 sentences:',
    '1. The forecasted outcome in plain language with the numbers above.',
    '2. The single highest-leverage group the user should start with and why.',
  ].join('\n')
}

export function buildSearchInsightPrompt(args: {
  domain: string
  industry: string
  losersCount: number
  strikingCount: number
  noImpressionsCount: number
  avgPosition: number
  avgCtr: number
}): string {
  return [
    'You are explaining the Search performance tab. Be specific. No generic SEO advice.',
    `Site: ${args.domain} (${args.industry})`,
    `Avg pos ${args.avgPosition.toFixed(1)}; avg CTR ${(args.avgCtr*100).toFixed(2)}%`,
    `Losers: ${args.losersCount}; Striking distance (4–20): ${args.strikingCount}; No impressions: ${args.noImpressionsCount}`,
    '',
    'Write 3 bullets, ≤16 words each:',
    '- One observation about visibility direction.',
    '- One striking-distance opportunity recommendation (specific count).',
    '- One coverage gap recommendation (specific count).',
  ].join('\n')
}
