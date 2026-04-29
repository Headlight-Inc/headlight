// services/right-sidebar/linksAuthority.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, percentile, topN } from './_helpers'
import {
  LinksOverviewTab, LinksInternalTab, LinksExternalTab, LinksAuthorityTab, LinksActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/links'

export interface LinksAuthorityStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  internal: {
    avgInlinks: number
    medianInlinks: number
    p95Inlinks: number
    orphanPages: number
    pagesWithOnly1Inlink: number
    avgDepth: number
  }
  external: {
    totalOutbound: number
    avgOutboundPerPage: number
    nofollowPct: number
    brokenExternals: number
  }
  authority: {
    backlinks: number | null
    referringDomains: number | null
    domainRating: number | null
    source: 'ahrefs' | 'majestic' | 'mozdata' | 'gsc' | 'none'
    fetchedAt?: number
  }
  topInlinkPages: { url: string; inlinks: number }[]
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]
}

export function computeLinksAuthorityStats(deps: RsDataDeps): LinksAuthorityStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  const inlinks = pages.map(p => p.inlinks ?? 0)
  const orphans = inlinks.filter(x => x === 0).length
  const oneInlink = inlinks.filter(x => x === 1).length
  const avgInlinks = n ? Math.round(inlinks.reduce((s, x) => s + x, 0) / n) : 0
  const medianInlinks = percentile(inlinks, 50)
  const p95Inlinks = percentile(inlinks, 95)
  const avgDepth = n ? Math.round(pages.reduce((s, p) => s + (p.depth ?? 0), 0) / n) : 0

  const totalOutbound = pages.reduce((s, p) => s + (p.externalLinks?.length ?? 0), 0)
  const nofollowOutbound = pages.reduce((s, p) => s + (p.externalLinks?.filter(l => l.rel?.includes('nofollow')).length ?? 0), 0)
  const brokenExternals = pages.reduce((s, p) => s + (p.brokenExternalCount ?? 0), 0)

  // Authority adapter (ahrefs/majestic/mozdata) — single source picked in priority order
  const a = conn.ahrefs ?? conn.majestic ?? conn.mozdata
  const source: LinksAuthorityStats['authority']['source'] =
    conn.ahrefs ? 'ahrefs' : conn.majestic ? 'majestic' : conn.mozdata ? 'mozdata' : conn.gsc ? 'gsc' : 'none'
  const summary = (a?.summary ?? {}) as { backlinks?: number; refDomains?: number; dr?: number }

  const score = Math.round(
    0.30 * (orphans === 0 ? 100 : Math.max(0, 100 - (orphans / Math.max(1, n)) * 100)) +
    0.20 * (avgInlinks >= 5 ? 100 : avgInlinks * 20) +
    0.20 * (brokenExternals === 0 ? 100 : Math.max(0, 100 - brokenExternals)) +
    0.30 * (summary.dr != null ? Math.min(100, summary.dr) : 50)
  )

  const topInlinkPages = topN(
    pages.map(p => ({ url: p.url, inlinks: p.inlinks ?? 0 })),
    10, p => p.inlinks
  )

  const actions: LinksAuthorityStats['actions'] = [
    { id: 'fix-orphans',     label: `Internal-link ${orphans} orphan pages`,         effort: 'medium', impact: orphans },
    { id: 'boost-1-inlink',  label: `Boost ${oneInlink} pages with only 1 inlink`,    effort: 'medium', impact: oneInlink },
    { id: 'fix-broken-ext',  label: `Fix ${brokenExternals} broken external links`,   effort: 'low',    impact: brokenExternals },
  ].filter(a => a.impact > 0)

  return {
    overall: {
      score,
      chips: [
        { label: 'Orphans',  value: `${orphans}`, tone: orphans === 0 ? 'good' : 'warn' },
        { label: 'Avg in',   value: `${avgInlinks}`, tone: avgInlinks >= 5 ? 'good' : 'warn' },
        { label: 'Broken',   value: `${brokenExternals}`, tone: brokenExternals === 0 ? 'good' : 'bad' },
        { label: 'DR',       value: summary.dr != null ? `${summary.dr}` : '—', tone: 'info' },
      ],
    },
    internal: { avgInlinks, medianInlinks, p95Inlinks, orphanPages: orphans, pagesWithOnly1Inlink: oneInlink, avgDepth },
    external: {
      totalOutbound,
      avgOutboundPerPage: n ? Math.round(totalOutbound / n) : 0,
      nofollowPct: pct(nofollowOutbound, totalOutbound),
      brokenExternals,
    },
    authority: {
      backlinks: summary.backlinks ?? null,
      referringDomains: summary.refDomains ?? null,
      domainRating: summary.dr ?? null,
      source,
      fetchedAt: a?.lastFetchedAt as number | undefined,
    },
    topInlinkPages,
    actions,
  }
}

export const linksAuthorityBundle: RsModeBundle<LinksAuthorityStats> = {
  mode: 'linksAuthority',
  accent: 'teal',
  defaultTabId: 'links_overview',
  tabs: [
    { id: 'links_overview',  label: 'Overview',  Component: LinksOverviewTab },
    { id: 'links_internal',  label: 'Internal',  Component: LinksInternalTab },
    { id: 'links_external',  label: 'External',  Component: LinksExternalTab },
    { id: 'links_authority', label: 'Authority', Component: LinksAuthorityTab },
    { id: 'links_actions',   label: 'Actions',   Component: LinksActionsTab },
  ],
  computeStats: computeLinksAuthorityStats,
}
