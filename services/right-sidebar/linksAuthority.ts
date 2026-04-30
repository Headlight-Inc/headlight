import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { countWhere, avg, pct, topN } from './utils'
import { LinksOverviewTab, LinksInternalTab, LinksExternalTab, LinksAnchorsTab, LinksToxicTab } from '../../components/seo-crawler/right-sidebar/modes/linksAuthority'

export interface LinksAuthorityStats {
  source: 'ahrefs' | 'semrush' | 'majestic' | 'crawler' | 'none'
  authorityScore: number
  internal: { totalLinks: number; avgPerPage: number; orphans: number; deepPages: number; brokenInternal: number; nofollowInternal: number }
  external: { domains: number; backlinks: number; drAvg: number; new90d: number; lost90d: number; outboundBroken: number; nofollowExternal: number }
  anchorMix: { brand: number; exact: number; partial: number; generic: number; url: number; image: number }
  toxic: { domains: number; spamPagesPct: number; topToxic: ReadonlyArray<{ domain: string; score: number }> }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeLinksAuthorityStats(deps: RsDataDeps): LinksAuthorityStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}
  const ah = conn.ahrefs, sm = conn.semrush, mj = conn.majestic
  const source: LinksAuthorityStats['source'] = ah ? 'ahrefs' : sm ? 'semrush' : mj ? 'majestic' : pages.length ? 'crawler' : 'none'
  const sum = ((ah ?? sm ?? mj)?.summary ?? {}) as any

  const orphans       = countWhere(pages, p => Number(p?.inlinks ?? 0) === 0 && Number(p?.crawlDepth ?? 0) > 0)
  const deep          = countWhere(pages, p => Number(p?.crawlDepth ?? 0) > 5)
  const brokenInt     = countWhere(pages, p => Number(p?.brokenInternalLinks ?? 0) > 0)
  const nofollowInt   = countWhere(pages, p => Number(p?.nofollowInternalLinks ?? 0) > 0)
  const totalInternal = pages.reduce((s, p) => s + Number(p?.inlinks ?? 0), 0)
  const avgPerPage    = Math.round(totalInternal / n * 10) / 10

  const externalBroken = countWhere(pages, p => Number(p?.brokenExternalLinks ?? 0) > 0)
  const nofollowExt    = countWhere(pages, p => Number(p?.nofollowExternalLinks ?? 0) > 0)
  const drAvg          = (sum.domainRating ?? Math.round(avg(pages.map(p => Number(p?.urlRating ?? 0)).filter(x => x > 0)))) || 0
  const refDomains     = sum.referringDomains ?? pages.reduce((s, p) => s + Number(p?.referringDomains ?? 0), 0)
  const backlinks      = sum.backlinks        ?? pages.reduce((s, p) => s + Number(p?.backlinks         ?? 0), 0)

  const mix = sum.anchorMix ?? estimateAnchors(pages)

  const toxic = sum.topToxic ? topN(sum.topToxic.map((x: any) => ({ domain: x.domain, count: x.score, score: x.score })), 8) : []

  const actions: RsAction[] = []
  if (orphans)       actions.push({ id: 'orph',  label: `Link to ${orphans} orphan pages`,       severity: 'highLeverage', effort: 'low', impact: 60, pagesAffected: orphans })
  if (deep)          actions.push({ id: 'depth', label: `Reduce depth on ${deep} pages`,         severity: 'strategic',    effort: 'med', impact: 40, pagesAffected: deep })
  if (brokenInt)     actions.push({ id: 'bint',  label: `Fix ${brokenInt} broken internal links`, severity: 'highLeverage', effort: 'low', impact: 60, pagesAffected: brokenInt })
  if (externalBroken)actions.push({ id: 'bext',  label: `Fix ${externalBroken} broken external links`, severity: 'strategic', effort: 'low', impact: 30, pagesAffected: externalBroken })
  if (mix.exact > mix.brand + mix.partial) actions.push({ id: 'anchor', label: 'Diversify exact-match anchors', severity: 'highLeverage', effort: 'med', impact: 60 })
  if ((sum.toxicCount ?? toxic.length) > 0) actions.push({ id: 'tox',   label: `Disavow ${sum.toxicCount ?? toxic.length} toxic domains`, severity: 'revenueLoss', effort: 'med', impact: 70 })

  const authorityScore = Math.round(0.5 * drAvg + 0.3 * Math.min(100, refDomains / 10) + 0.2 * Math.min(100, totalInternal / 100))

  return {
    source,
    authorityScore,
    internal: { totalLinks: totalInternal, avgPerPage, orphans, deepPages: deep, brokenInternal: brokenInt, nofollowInternal: nofollowInt },
    external: { domains: refDomains, backlinks, drAvg, new90d: sum.new90d ?? 0, lost90d: sum.lost90d ?? 0, outboundBroken: externalBroken, nofollowExternal: nofollowExt },
    anchorMix: mix,
    toxic: { domains: sum.toxicCount ?? toxic.length, spamPagesPct: sum.spamSharePct ?? 0, topToxic: toxic },
    actions,
    fetchedAt: (ah ?? sm ?? mj)?.lastFetchedAt,
  }
}
function estimateAnchors(pages: ReadonlyArray<any>) {
  const all = pages.flatMap(p => Array.isArray(p?.outlinksList) ? p.outlinksList : [])
  const m = { brand: 0, exact: 0, partial: 0, generic: 0, url: 0, image: 0 }
  for (const a of all) {
    const t = String((a?.anchorText ?? '')).trim().toLowerCase()
    if (!t) m.image++
    else if (/^(click here|read more|learn more|here|more)$/.test(t)) m.generic++
    else if (/^https?:\/\//.test(t)) m.url++
    else m.partial++
  }
  return m
}

export const linksAuthorityBundle: RsModeBundle<LinksAuthorityStats> = {
  mode: 'linksAuthority', accent: 'teal', defaultTabId: 'links_overview',
  tabs: [
    { id: 'links_overview', label: 'Overview', Component: LinksOverviewTab },
    { id: 'links_internal', label: 'Internal', Component: LinksInternalTab },
    { id: 'links_external', label: 'External', Component: LinksExternalTab },
    { id: 'links_anchors',  label: 'Anchors',  Component: LinksAnchorsTab },
    { id: 'links_toxic',    label: 'Toxic',    Component: LinksToxicTab },
  ],
  computeStats: computeLinksAuthorityStats,
}
