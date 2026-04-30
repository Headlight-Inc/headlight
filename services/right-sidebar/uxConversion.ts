import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { countWhere, pct } from './utils'
import { UxOverviewTab, UxFrictionTab, UxFunnelsTab, UxTestsTab, UxActionsTab } from '../../components/seo-crawler/right-sidebar/modes/uxConversion'

export interface UxConversionStats {
  overview: { siteCvrPct: number | null; topGoal: { label: string; pct: number } | null; engageTimeSec: number | null; cwvPassPct: number; deviceMix: { mobile: number; desktop: number; tablet: number }; rageClicks: number }
  friction: { rageClicks: number; deadClicks: number; errorPages: number; formAbandonRate: number; topRageUrls: ReadonlyArray<{ url: string; clicks: number }>; topDeadUrls: ReadonlyArray<{ url: string; clicks: number }> }
  funnels: { steps: ReadonlyArray<{ name: string; users: number; dropPct: number }>; topDropoffStep: string | null; medianTimeSec: number | null }
  tests: { activeTests: number; lifts: ReadonlyArray<{ name: string; liftPct: number; significance: 'low' | 'med' | 'high' }>; backlog: number }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeUxConversionStats(deps: RsDataDeps): UxConversionStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}
  const ga4 = (conn.ga4?.summary ?? {}) as any
  const heat = (conn.heatmaps?.summary ?? {}) as any
  const ab = (conn.experiments?.summary ?? {}) as any

  const cwvPass = countWhere(pages, p =>
    Number(p?.lcp ?? Infinity) <= 2500 && Number(p?.inp ?? 0) <= 200 && Number(p?.cls ?? 0) <= 0.1)

  const rage = heat.rageClicks ?? countWhere(pages, p => Number(p?.rageClicks ?? 0) > 0)
  const dead = heat.deadClicks ?? countWhere(pages, p => Number(p?.deadClicks ?? 0) > 0)
  const errPages = countWhere(pages, p => Number(p?.statusCode ?? 0) >= 400)

  const deviceMix = ga4.deviceMix ?? { mobile: 0, desktop: 0, tablet: 0 }
  const cvr = ga4.conversionRate ?? null
  const topGoal = ga4.topGoal ?? null
  const engagement = ga4.engagementTimeSec ?? null

  const stepsRaw = ga4.funnel ?? []
  const steps = stepsRaw.map((s: any, i: number) => ({
    name: s.name,
    users: s.users,
    dropPct: i === 0 ? 0 : pct(stepsRaw[i - 1].users - s.users, stepsRaw[i - 1].users || 1),
  }))
  const topDrop = steps.slice(1).sort((a: any, b: any) => b.dropPct - a.dropPct)[0]?.name ?? null

  const actions: RsAction[] = []
  if (rage > 0) actions.push({ id: 'rage', label: `Investigate ${rage} pages with rage clicks`, severity: 'highLeverage', effort: 'med', impact: 60 })
  if (errPages) actions.push({ id: 'errs', label: `Fix ${errPages} error pages`, severity: 'blocking', effort: 'low', impact: 80 })
  if (cvr != null && cvr < 0.01) actions.push({ id: 'cvr', label: 'Site-wide CVR < 1%, audit high-traffic templates', severity: 'highLeverage', effort: 'med', impact: 70 })
  if (topDrop) actions.push({ id: 'drop', label: `Reduce drop-off at "${topDrop}"`, severity: 'highLeverage', effort: 'med', impact: 60 })

  return {
    overview: {
      siteCvrPct: cvr != null ? Number((cvr * 100).toFixed(2)) : null,
      topGoal: topGoal ? { label: topGoal.label, pct: topGoal.pct ?? 0 } : null,
      engageTimeSec: engagement,
      cwvPassPct: pct(cwvPass, n),
      deviceMix,
      rageClicks: rage,
    },
    friction: {
      rageClicks: rage, deadClicks: dead, errorPages: errPages,
      formAbandonRate: heat.formAbandonRate ?? 0,
      topRageUrls: heat.topRageUrls ?? [],
      topDeadUrls: heat.topDeadUrls ?? [],
    },
    funnels: {
      steps,
      topDropoffStep: topDrop,
      medianTimeSec: ga4.medianFunnelTimeSec ?? null,
    },
    tests: {
      activeTests: ab.active ?? 0,
      lifts: ab.lifts ?? [],
      backlog: ab.backlog ?? 0,
    },
    actions,
    fetchedAt: conn.ga4?.lastFetchedAt,
  }
}

export const uxConversionBundle: RsModeBundle<UxConversionStats> = {
  mode: 'uxConversion', accent: 'rose', defaultTabId: 'ux_overview',
  tabs: [
    { id: 'ux_overview', label: 'Overview', Component: UxOverviewTab },
    { id: 'ux_friction', label: 'Friction', Component: UxFrictionTab },
    { id: 'ux_funnels',  label: 'Funnels',  Component: UxFunnelsTab },
    { id: 'ux_tests',    label: 'Tests',    Component: UxTestsTab },
    { id: 'ux_actions',  label: 'Actions',  Component: UxActionsTab },
  ],
  computeStats: computeUxConversionStats,
}
