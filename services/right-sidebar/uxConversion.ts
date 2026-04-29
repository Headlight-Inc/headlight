// services/right-sidebar/uxConversion.ts
import type { RsModeBundle, RsDataDeps } from './types'
import { countWhere, pct, percentile, topN } from './_helpers'
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
}

export function computeUxConversionStats(deps: RsDataDeps): UxConversionStats {
  const pages = deps.pages
  const n = pages.length
  const conn = deps.integrationConnections

  // Performance (p75)
  const lcps = pages.map(p => p.lcpMs ?? 0).filter(x => x > 0)
  const inps = pages.map(p => p.inpMs ?? 0).filter(x => x > 0)
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
