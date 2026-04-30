import type { ReactNode } from 'react'

export type Mode =
  | 'fullAudit' | 'wqa' | 'technical' | 'content' | 'linksAuthority'
  | 'uxConversion' | 'paid' | 'commerce' | 'socialBrand' | 'ai'
  | 'competitors' | 'local'

export type RsAccent =
  | 'slate' | 'violet' | 'blue' | 'amber' | 'teal'
  | 'rose' | 'cyan' | 'green' | 'indigo' | 'fuchsia' | 'red' | 'orange'

export type RsTabId =
  | `full_${string}` | `wqa_${string}` | `tech_${string}`
  | `content_${string}` | `links_${string}` | `ux_${string}`
  | `paid_${string}` | `commerce_${string}` | `social_${string}`
  | `ai_${string}` | `comp_${string}` | `local_${string}`

/** All data the RS computes against. Built once per mode change in RsRouter. */
export interface RsDataDeps {
  pages: ReadonlyArray<any>
  industry?: string
  domain?: string
  filters: Record<string, unknown>
  integrationConnections: Record<string, any>
  wqaState: Record<string, any>
  wqaFilter?: unknown
}

export interface RsTabProps<TStats> {
  deps: RsDataDeps
  stats: TStats
}

export interface RsTabRenderer<TStats> {
  id: RsTabId
  label: string
  Component: (props: RsTabProps<TStats>) => JSX.Element | null
}

export interface RsModeBundle<TStats = unknown> {
  mode: Mode
  accent: RsAccent
  defaultTabId: RsTabId
  tabs: ReadonlyArray<RsTabRenderer<TStats>>
  computeStats: (deps: RsDataDeps) => TStats
}

export interface OverallChip { label: string; value: string | number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }
export interface OverallScore { score: number; chips: ReadonlyArray<OverallChip> }

export type ActionEffort = 'low' | 'med' | 'high'
export interface RsAction {
  id: string
  label: string
  description?: string
  severity: 'blocking' | 'revenueLoss' | 'highLeverage' | 'strategic' | 'hygiene'
  effort: ActionEffort
  impact: number       // 0..100
  pagesAffected?: number
  forecast?: Forecast
}

export interface Forecast {
  label: string
  unit: string
  deltaValue: number
  positiveIsGood?: boolean
  confidencePct: number
}

export interface SourceStamp {
  tier: 'authoritative' | 'browser' | 'scrape' | 'ai' | 'estimated' | 'default'
  name: string
  url?: string
}
