// services/right-sidebar/fullAudit.ts (top half)
import type { CrawledPage } from '../CrawlDatabase'
import type { RsModeBundle, RsDataDeps } from './types'
import {
  countWhere, isIndexable, hasTitle, hasMetaDescription, hasH1, isThin,
  pct, score100, topN, dedupCount, avg,
} from './_helpers'
import {
  FullOverviewTab, FullTechTab, FullContentTab, FullLinksTab, FullActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/fullAudit'

export interface FullAuditStats {
  overallScore: number               // 0–100
  radar: { axis: string; value: number }[]   // 5 axes
  heroChips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info'|'neutral' }[]
  tech: {
    httpsPct: number
    avgResponseMs: number | null
    indexablePct: number
    brokenPages: number
    schemaCoveragePct: number
  }
  content: {
    titleCoveragePct: number
    descCoveragePct: number
    h1CoveragePct: number
    thinPct: number
    avgWords: number
    dupTitles: number
    dupDescriptions: number
  }
  links: {
    avgInternalLinks: number
    avgExternalLinks: number
    orphanPages: number
    redirectChains: number
    brokenLinks: number
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number; filter?: unknown }[]
}

export function computeFullAuditStats(deps: RsDataDeps): FullAuditStats {
  const pages = deps.pages
  const n = pages.length

  const indexable = countWhere(pages, isIndexable)
  const withTitle = countWhere(pages, hasTitle)
  const withDesc  = countWhere(pages, hasMetaDescription)
  const withH1    = countWhere(pages, hasH1)
  const thin      = countWhere(pages, isThin)
  const https     = countWhere(pages, p => (p.url || '').startsWith('https://'))
  const broken    = countWhere(pages, p => (p.status ?? 0) >= 400)
  const schemaOk  = countWhere(pages, p => (p.schemaTypes?.length ?? 0) > 0)

  const respTimes = pages.map(p => p.loadTime ?? 0).filter(x => x > 0)
  const avgResp = respTimes.length ? Math.round(avg(respTimes)) : null

  const dupTitles = dedupCount(pages, p => p.title?.trim() || null)
  const dupDescs  = dedupCount(pages, p => p.metaDesc?.trim() || null)
  const wordSum = pages.reduce((s, p) => s + (p.wordCount ?? 0), 0)
  const avgWords = n ? Math.round(wordSum / n) : 0

  const internalSum = pages.reduce((s, p) => s + (p.internalLinks?.length ?? 0), 0)
  const externalSum = pages.reduce((s, p) => s + (p.externalLinks?.length ?? 0), 0)
  const orphans   = countWhere(pages, p => (p.inlinks ?? 0) === 0)
  const redirects = countWhere(pages, p => (p.status ?? 0) >= 300 && (p.status ?? 0) < 400)
  const brokenLnk = pages.reduce((s, p) => s + (p.brokenLinkCount ?? 0), 0)

  // Radar axes
  const radar: FullAuditStats['radar'] = [
    { axis: 'Tech',    value: score100([
      { weight: 2, value: pct(https, n) },
      { weight: 1, value: avgResp == null ? 50 : Math.max(0, 100 - avgResp / 30) },
      { weight: 2, value: pct(indexable, n) },
      { weight: 1, value: 100 - pct(broken, n) },
    ])},
    { axis: 'Content', value: score100([
      { weight: 1, value: pct(withTitle, n) },
      { weight: 1, value: pct(withDesc, n) },
      { weight: 1, value: pct(withH1, n) },
      { weight: 1, value: 100 - pct(thin, n) },
    ])},
    { axis: 'Links',   value: score100([
      { weight: 1, value: 100 - pct(orphans, n) },
      { weight: 1, value: 100 - pct(redirects, n) },
      { weight: 1, value: brokenLnk === 0 ? 100 : Math.max(0, 100 - brokenLnk) },
    ])},
    { axis: 'Schema',  value: pct(schemaOk, n) },
    { axis: 'Trust',   value: pct(https, n) },
  ]
  const overallScore = Math.round(radar.reduce((s, r) => s + r.value, 0) / radar.length)

  const heroChips: FullAuditStats['heroChips'] = [
    { label: 'Indexable', value: `${pct(indexable, n)}%`, tone: pct(indexable, n) >= 80 ? 'good' : 'warn' },
    { label: 'HTTPS',     value: `${pct(https, n)}%`,    tone: pct(https, n) >= 95 ? 'good' : 'bad' },
    { label: 'Broken',    value: `${broken}`,            tone: broken === 0 ? 'good' : 'bad' },
    { label: 'Schema',    value: `${pct(schemaOk, n)}%`, tone: pct(schemaOk, n) >= 60 ? 'good' : 'warn' },
  ]
  if (deps.wqaState?.detectedCms)      heroChips.push({ label: 'CMS', value: deps.wqaState.detectedCms, tone: 'info' })
  if (deps.wqaState?.detectedLanguage) heroChips.push({ label: 'Lang', value: deps.wqaState.detectedLanguage, tone: 'info' })

  const actions: FullAuditStats['actions'] = [
    { id: 'add-titles',     label: `Add titles to ${n - withTitle} pages`,    effort: 'low',    impact: n - withTitle },
    { id: 'add-desc',       label: `Add descriptions to ${n - withDesc} pages`, effort: 'low',  impact: n - withDesc },
    { id: 'add-h1',         label: `Add H1 to ${n - withH1} pages`,           effort: 'low',    impact: n - withH1 },
    { id: 'expand-thin',    label: `Expand ${thin} thin pages (<300 words)`,  effort: 'medium', impact: thin },
    { id: 'fix-dup-titles', label: `Resolve ${dupTitles} duplicate titles`,   effort: 'medium', impact: dupTitles },
    { id: 'fix-broken',     label: `Fix ${broken} broken pages`,              effort: 'high',   impact: broken },
    { id: 'fix-orphans',    label: `Internal-link ${orphans} orphan pages`,   effort: 'medium', impact: orphans },
    { id: 'add-schema',     label: `Add schema to ${n - schemaOk} pages`,     effort: 'medium', impact: n - schemaOk },
  ].filter(a => a.impact > 0)

  return {
    overallScore, radar, heroChips,
    tech: {
      httpsPct: pct(https, n),
      avgResponseMs: avgResp,
      indexablePct: pct(indexable, n),
      brokenPages: broken,
      schemaCoveragePct: pct(schemaOk, n),
    },
    content: {
      titleCoveragePct: pct(withTitle, n),
      descCoveragePct: pct(withDesc, n),
      h1CoveragePct: pct(withH1, n),
      thinPct: pct(thin, n),
      avgWords,
      dupTitles, dupDescriptions: dupDescs,
    },
    links: {
      avgInternalLinks: n ? Math.round(internalSum / n) : 0,
      avgExternalLinks: n ? Math.round(externalSum / n) : 0,
      orphanPages: orphans,
      redirectChains: redirects,
      brokenLinks: brokenLnk,
    },
    actions: topN(actions, 8, a => a.impact),
  }
}

export const fullAuditBundle: RsModeBundle<FullAuditStats> = {
  mode: 'fullAudit',
  accent: 'slate',
  defaultTabId: 'full_overview',
  tabs: [
    { id: 'full_overview', label: 'Overview', Component: FullOverviewTab },
    { id: 'full_tech',     label: 'Tech',     Component: FullTechTab },
    { id: 'full_content',  label: 'Content',  Component: FullContentTab },
    { id: 'full_links',    label: 'Links',    Component: FullLinksTab },
    { id: 'full_actions',  label: 'Actions',  Component: FullActionsTab },
  ],
  computeStats: computeFullAuditStats,
}
