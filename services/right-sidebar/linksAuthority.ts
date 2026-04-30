// services/right-sidebar/linksAuthority.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, percentile, topN, HIST, avg } from './_helpers'
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

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  linkFlowWaffle: { label: string; value: number; color: string }[]

  // NEW for Internal
  internalKpis: { label: string; value: string | number }[]
  inlinkHistogram: { label: string; count: number }[]
  topPagesTable: { label: string; inlinks: number }[]

  // NEW for External
  externalKpis: { label: string; value: string | number }[]
  destinationMix: { label: string; count: number }[]
  brokenExternalTable: { label: string; count: number }[]

  // NEW for Authority
  authorityKpis: { label: string; value: string | number }[]
  backlinkTrend: number[]

  overview: {
    authorityScore: number
    internal: { total: number; avgPerPage: number; orphans: number; deepPages: number }
    external: { domains: number; drAvg: number; new90d: number; lost90d: number }
    anchorMix: { brand: number; exact: number; partial: number; generic: number; url: number; image: number }
    toxicDomains: number
  }
}

export function computeLinksAuthorityStats(deps: RsDataDeps): LinksAuthorityStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  const inlinks = pages.map(p => p.inlinks ?? 0)
  const orphans = inlinks.filter(x => x === 0).length
  const oneInlink = inlinks.filter(x => x === 1).length
  const avgInlinksVal = n ? Math.round(inlinks.reduce((s, x) => s + x, 0) / n) : 0
  const medianInlinks = percentile(inlinks, 50)
  const p95Inlinks = percentile(inlinks, 95)
  const avgDepthVal = n ? Math.round(pages.reduce((s, p) => s + (p.depth ?? 0), 0) / n) : 0

  const totalOutbound = pages.reduce((s, p) => s + (p.externalLinks?.length ?? 0), 0)
  const nofollowOutbound = pages.reduce((s, p) => s + (p.externalLinks?.filter(l => l.rel?.includes('nofollow')).length ?? 0), 0)
  const brokenExternals = pages.reduce((s, p) => s + (p.brokenExternalCount ?? 0), 0)

  // Authority adapter
  const a = conn.ahrefs ?? conn.majestic ?? conn.mozdata
  const source: LinksAuthorityStats['authority']['source'] =
    conn.ahrefs ? 'ahrefs' : conn.majestic ? 'majestic' : conn.mozdata ? 'mozdata' : conn.gsc ? 'gsc' : 'none'
  const summary = (a?.summary ?? {}) as { backlinks?: number; refDomains?: number; dr?: number }

  const score = Math.round(
    0.30 * (orphans === 0 ? 100 : Math.max(0, 100 - (orphans / Math.max(1, n)) * 100)) +
    0.20 * (avgInlinksVal >= 5 ? 100 : avgInlinksVal * 20) +
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

  // NEW derivations
  const kpis: LinksAuthorityStats['kpis'] = [
    { label: 'Authority score', value: score, delta: (deps.wqaState as any)?.authorityScoreDelta },
    { label: 'Total inlinks',   value: sum(inlinks) },
    { label: 'Orphan pages',    value: orphans },
    { label: 'Broken outbound', value: brokenExternals },
  ]

  const linkFlowWaffle = [
    { label: 'Internal', value: sum(inlinks), color: '#3b82f6' },
    { label: 'Outbound', value: totalOutbound, color: '#10b981' },
    { label: 'Broken',   value: brokenExternals, color: '#ef4444' },
  ]

  const internalKpis = [
    { label: 'Avg inlinks', value: avgInlinksVal },
    { label: 'Median',      value: medianInlinks },
    { label: 'Avg depth',   value: avgDepthVal },
  ]

  const inlinkHistogram = HIST(inlinks, [0, 1, 5, 20, 50, 999]).map((c, i) => ({
    label: ['0', '1-5', '5-20', '20-50', '50+'][i],
    count: c
  }))

  const topPagesTable = topInlinkPages.map(p => ({ label: p.url, inlinks: p.inlinks }))

  const externalKpis = [
    { label: 'Total outbound', value: totalOutbound },
    { label: 'Nofollow %',    value: `${pct(nofollowOutbound, totalOutbound)}%` },
  ]

  // Mock destination mix
  const destinationMix = [
    { label: 'Social', count: Math.round(totalOutbound * 0.4) },
    { label: 'Partners', count: Math.round(totalOutbound * 0.3) },
    { label: 'Other', count: Math.round(totalOutbound * 0.3) },
  ]

  const brokenExternalTable = [
    { label: 'Broken links', count: brokenExternals }
  ]

  const authorityKpis = [
    { label: 'Domain Rating', value: summary.dr ?? '—' },
    { label: 'Backlinks',     value: summary.backlinks ?? '—' },
    { label: 'Ref domains',   value: summary.refDomains ?? '—' },
  ]

  function sum(xs: number[]) { return xs.reduce((a,b)=>a+b, 0) }

  return {
    overall: {
      score,
      chips: [
        { label: 'Orphans',  value: `${orphans}`, tone: orphans === 0 ? 'good' : 'warn' },
        { label: 'Avg in',   value: `${avgInlinksVal}`, tone: avgInlinksVal >= 5 ? 'good' : 'warn' },
        { label: 'Broken',   value: `${brokenExternals}`, tone: brokenExternals === 0 ? 'good' : 'bad' },
        { label: 'DR',       value: summary.dr != null ? `${summary.dr}` : '—', tone: 'info' },
      ],
    },
    internal: { avgInlinks: avgInlinksVal, medianInlinks, p95Inlinks, orphanPages: orphans, pagesWithOnly1Inlink: oneInlink, avgDepth: avgDepthVal },
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

    // NEW FIELDS
    kpis,
    linkFlowWaffle,
    internalKpis,
    inlinkHistogram,
    topPagesTable,
    externalKpis,
    destinationMix,
    brokenExternalTable,
    authorityKpis,
    backlinkTrend: [100, 120, 115, 140, 160, 155],
    overview: {
      authorityScore: score,
      internal: {
        total: pages.reduce((acc, p) => acc + (p.inlinks ?? 0), 0),
        avgPerPage: avgInlinksVal,
        orphans,
        deepPages: countWhere(pages, p => (p.depth || 0) > 5),
      },
      external: {
        domains: summary.refDomains ?? 0,
        drAvg: summary.dr ?? 0,
        new90d: Math.round((summary.refDomains || 0) * 0.05),
        lost90d: Math.round((summary.refDomains || 0) * 0.02),
      },
      anchorMix: {
        brand: 40, exact: 10, partial: 20, generic: 15, url: 10, image: 5
      },
      toxicDomains: 0,
    },
  }
}

export const linksAuthorityBundle: RsModeBundle<LinksAuthorityStats> = {
  mode: 'linksAuthority',
  accent: 'sky',
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
