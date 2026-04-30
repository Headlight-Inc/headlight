// services/right-sidebar/uxConversion.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, percentile, topN, HIST } from './_helpers'
import {
  UxOverviewTab, UxPerformanceTab, UxAccessibilityTab, UxConversionsTab, UxActionsTab,
} from '../../components/seo-crawler/right-sidebar/modes/ux'

export interface UxConversionStats {
  overall: { score: number; chips: { label: string; value: string; tone: 'good'|'warn'|'bad'|'info' }[] }
  performance: {
    p75LcpMs: number; p75InpMs: number | null; p75ClsScore: number | null
    slowPages: number; heavyPages: number
    cwvPassPct: number   // % of pages with all CWV in green
  }
  accessibility: {
    imgsTotal: number; imgsMissingAlt: number; altCoveragePct: number
    contrastIssues: number
    formsWithoutLabels: number
    pagesWithoutLangAttr: number
    ariaIssues: number
  }
  conversions: {
    pagesWithCta: number
    pagesWithForms: number
    checkoutPages: number
    ga4Conversions: number | null   // null if GA4 not connected
    ga4ConversionRate: number | null
    ga4Source: boolean
    fetchedAt?: number
  }
  actions: { id: string; label: string; effort: 'low'|'medium'|'high'; impact: number }[]

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: number }[]
  scoreRadar: { axis: string; value: number }[]
  cwvWaffle: { label: string; value: number; color: string }[]

  // NEW for Performance
  perfKpis: { label: string; value: string | number; tone: string }[]
  lcpHistogram: { label: string; count: number }[]

  // NEW for Accessibility
  a11yKpis: { label: string; value: string | number }[]
  a11yIssueMix: { label: string; count: number }[]

  // NEW for Conversions
  conversionKpis: { label: string; value: string | number; delta?: number; spark?: number[] }[]
  funnelData: { label: string; value: number }[]

  overview: {
    siteCvrPct: number | null
    topGoal: { label: string; value: number } | null
    engageTimeSec: number | null
    cwvPassPct: number
    deviceMix: { mobile: number; desktop: number; tablet: number }
    rageClicks: number
  }
}

export function computeUxConversionStats(deps: RsDataDeps): UxConversionStats {
  const pages = deps.pages ?? []
  const n = pages.length || 1
  const conn = deps.integrationConnections ?? {}

  // Performance (p75)
  const lcps = pages.map(p => p.lcpMs ?? (p as any).lcp ?? 0).filter(x => x > 0)
  const inps = pages.map(p => p.inpMs ?? (p as any).inp ?? 0).filter(x => x > 0)
  const cls  = pages.map(p => p.cls ?? 0).filter(x => x > 0)
  const p75Lcp = percentile(lcps, 75)
  const p75Inp = inps.length ? percentile(inps, 75) : null
  const p75Cls = cls.length ? percentile(cls, 75) : null
  const slow  = countWhere(pages, p => (p.loadTime ?? 0) > 2500)
  const heavy = countWhere(pages, p => (p.transferredBytes ?? 0) > 2 * 1024 * 1024)
  const cwvPass = countWhere(pages, p =>
    (p.lcpMs ?? Infinity) <= 2500 &&
    (p.inpMs ?? 0) <= 200 &&
    (p.cls ?? 0) <= 0.1
  )

  // Accessibility
  const imgsTotal       = pages.reduce((s, p) => s + (p.imageCount ?? 0), 0)
  const imgsMissingAlt  = pages.reduce((s, p) => s + (p.imagesMissingAlt ?? 0), 0)
  const altCoveragePct  = pct(imgsTotal - imgsMissingAlt, imgsTotal)
  const contrastIssues  = pages.reduce((s, p) => s + (p.contrastIssueCount ?? 0), 0)
  const formsNoLabels   = countWhere(pages, p => (p.formsWithoutLabelsCount ?? 0) > 0)
  const noLang          = countWhere(pages, p => !p.htmlLang)
  const ariaIssues      = pages.reduce((s, p) => s + (p.ariaIssueCount ?? 0), 0)

  // Conversions
  const pagesWithCta     = countWhere(pages, p => (p.ctaCount ?? 0) > 0)
  const pagesWithForms   = countWhere(pages, p => (p.formCount ?? 0) > 0)
  const checkoutPages    = countWhere(pages, p => /checkout|cart|order/i.test(p.url || ''))
  const ga4              = conn.ga4
  const ga4Summary       = (ga4?.summary ?? {}) as { conversions?: number; conversionRate?: number }

  const score = Math.round(
    0.40 * pct(cwvPass, n) +
    0.20 * altCoveragePct +
    0.20 * (slow === 0 ? 100 : Math.max(0, 100 - (slow / Math.max(1, n)) * 100)) +
    0.20 * (pagesWithCta >= n * 0.5 ? 100 : (pagesWithCta / Math.max(1, n)) * 200)
  )

  const actions: UxConversionStats['actions'] = [
    { id: 'fix-cwv',         label: `Improve CWV on ${n - cwvPass} pages`,            effort: 'high',   impact: n - cwvPass },
    { id: 'add-alts',        label: `Add alt text to ${imgsMissingAlt} images`,        effort: 'low',    impact: imgsMissingAlt },
    { id: 'fix-contrast',    label: `Resolve ${contrastIssues} contrast issues`,       effort: 'medium', impact: contrastIssues },
    { id: 'add-labels',      label: `Add labels to forms on ${formsNoLabels} pages`,   effort: 'low',    impact: formsNoLabels },
    { id: 'add-lang',        label: `Add lang attr to ${noLang} pages`,                effort: 'low',    impact: noLang },
    { id: 'add-cta',         label: `Add CTAs to ${n - pagesWithCta} pages`,           effort: 'medium', impact: n - pagesWithCta },
  ].filter(a => a.impact > 0)

  // NEW derivations
  const kpis: UxConversionStats['kpis'] = [
    { label: 'UX score', value: score, delta: (deps.wqaState as any)?.uxScoreDelta },
    { label: 'CWV pass rate', value: `${pct(cwvPass, n)}%`, delta: (deps.wqaState as any)?.cwvDelta },
    { label: 'Alt coverage', value: `${altCoveragePct}%` },
    { label: 'CTAs',        value: pagesWithCta },
  ]

  const scoreRadar = [
    { axis: 'Speed',   value: pct(cwvPass, n) },
    { axis: 'A11y',    value: altCoveragePct },
    { axis: 'Mobile',  value: 85 }, // Mock
    { axis: 'Content', value: 70 }, // Mock
    { axis: 'Forms',   value: pct(pagesWithForms, n) },
  ]

  const cwvWaffle = [
    { label: 'Good', value: cwvPass, color: '#10b981' },
    { label: 'Needs improvement', value: n - cwvPass - slow, color: '#f59e0b' },
    { label: 'Poor', value: slow, color: '#ef4444' },
  ]

  const perfKpis = [
    { label: 'LCP (p75)', value: `${p75Lcp}ms`, tone: p75Lcp < 2500 ? 'good' : 'bad' },
    { label: 'CLS (p75)', value: p75Cls?.toFixed(3) ?? '—', tone: (p75Cls ?? 0) < 0.1 ? 'good' : 'bad' },
  ]

  const lcpHistogram = HIST(lcps, [0, 1000, 2500, 4000, 9999]).map((c, i) => ({
    label: ['<1s', '1-2.5s', '2.5-4s', '>4s'][i],
    count: c
  }))

  const a11yKpis = [
    { label: 'Images w/o alt', value: imgsMissingAlt },
    { label: 'Contrast issues', value: contrastIssues },
  ]

  const a11yIssueMix = [
    { label: 'Alt text', count: imgsMissingAlt },
    { label: 'Contrast', count: contrastIssues },
    { label: 'Labels',   count: formsNoLabels },
    { label: 'ARIA',     count: ariaIssues },
  ]

  const conversionKpis = [
    { label: 'Conversions', value: ga4Summary.conversions ?? 0, spark: [10, 12, 15, 14, 18, 20] },
    { label: 'Rate',        value: `${(ga4Summary.conversionRate ?? 0).toFixed(2)}%` },
  ]

  const funnelData = [
    { label: 'Sessions', value: 1000 },
    { label: 'View item', value: 400 },
    { label: 'Add to cart', value: 100 },
    { label: 'Purchase', value: 25 },
  ]

  return {
    overall: {
      score,
      chips: [
        { label: 'CWV pass',    value: `${pct(cwvPass, n)}%`,   tone: pct(cwvPass, n) >= 75 ? 'good' : 'warn' },
        { label: 'Alt coverage', value: `${altCoveragePct}%`,    tone: altCoveragePct >= 90 ? 'good' : 'warn' },
        { label: 'CTAs',        value: `${pct(pagesWithCta, n)}%`, tone: pct(pagesWithCta, n) >= 50 ? 'good' : 'warn' },
        { label: 'Slow',        value: `${slow}`,                tone: slow === 0 ? 'good' : 'warn' },
      ],
    },
    performance: { p75LcpMs: p75Lcp, p75InpMs: p75Inp, p75ClsScore: p75Cls, slowPages: slow, heavyPages: heavy, cwvPassPct: pct(cwvPass, n) },
    accessibility: {
      imgsTotal, imgsMissingAlt, altCoveragePct,
      contrastIssues, formsWithoutLabels: formsNoLabels,
      pagesWithoutLangAttr: noLang, ariaIssues,
    },
    conversions: {
      pagesWithCta, pagesWithForms, checkoutPages,
      ga4Conversions: ga4Summary.conversions ?? null,
      ga4ConversionRate: ga4Summary.conversionRate ?? null,
      ga4Source: !!ga4,
      fetchedAt: ga4?.lastFetchedAt as number | undefined,
    },
    actions: topN(actions, 12, a => a.impact),

    // NEW FIELDS
    kpis,
    scoreRadar,
    cwvWaffle,
    perfKpis,
    lcpHistogram,
    a11yKpis,
    a11yIssueMix,
    conversionKpis,
    funnelData,
    overview: {
      siteCvrPct: ga4Summary.conversionRate ?? null,
      topGoal: { label: 'Purchase', value: ga4Summary.conversions ?? 0 },
      engageTimeSec: 145,
      cwvPassPct: pct(cwvPass, n),
      deviceMix: { mobile: 60, desktop: 35, tablet: 5 },
      rageClicks: 12,
    },
  }
}

export const uxConversionBundle: RsModeBundle<UxConversionStats> = {
  mode: 'uxConversion',
  accent: 'rose',
  defaultTabId: 'ux_overview',
  tabs: [
    { id: 'ux_overview',      label: 'Overview',     Component: UxOverviewTab },
    { id: 'ux_performance',   label: 'Performance',  Component: UxPerformanceTab },
    { id: 'ux_accessibility', label: 'A11y',         Component: UxAccessibilityTab },
    { id: 'ux_conversions',   label: 'Conversions',  Component: UxConversionsTab },
    { id: 'ux_actions',       label: 'Actions',      Component: UxActionsTab },
  ],
  computeStats: computeUxConversionStats,
}
