// services/right-sidebar/fullAudit.types.ts
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type IssueCategory = 'Content' | 'Tech' | 'Schema' | 'Links' | 'A11y' | 'Security'

export type AdapterId =
  | 'gsc' | 'bing' | 'gbp' | 'backlinks' | 'keywords'
  | 'contentInventory' | 'aiRouter' | 'mcpClients'

export interface FullAuditStats {
  // existing fields kept as-is
  overview: {
    score: number
    scoreDelta: number | null
    pages: number
    pagesNewThisSession: number | null
    indexablePct: number
    indexableDeltaPct: number | null
    issues: number
    issuesDelta: number | null
    statusMix: { code: '2xx' | '3xx' | '4xx' | '5xx'; count: number; color: string }[]
    depthHistogram: { label: string; value: number }[]
    categoryDonut: { label: string; value: number; color: string }[]
    crawl: {
      isRunning: boolean
      progressPct: number
      lastFinishedAt: number | null
      durationMs: number | null
      errors: number
      blocked: number
    }
  }
  issues: {
    severity: { tone: Severity; count: number }[]
    byCategory: { label: IssueCategory; count: number }[]
    top: {
      id: string
      label: string
      count: number
      severity: Severity
      filter?: Record<string, unknown>
    }[]
    trendAll: number[]
    trendCritical: number[]
    newThisSession: number
    resolvedThisSession: number
    total: number
  }
  scores: {
    overall: number
    overallDelta: number | null
    subscores: { axis: IssueCategory; value: number }[]
    cohort: { percentile: number; label: string } | null
    pageDistribution: { label: string; value: number }[]
    movers: { up: number; down: number }
  }

  // NEW for Overview
  kpis: { label: string; value: string | number; delta?: { value: number; positiveIsGood?: boolean }; spark?: number[] }[]
  statusMix: { label: string; count: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' }[]
  depthHistogram: { label: string; count: number }[]
  categoryDonut: { label: string; value: number }[]

  // NEW for Issues
  severityMix: { label: string; count: number; tone: 'good' | 'warn' | 'bad' }[]
  issueCategoryMix: { label: string; count: number }[]
  topIssues: { label: string; count: number }[]
  issuesNewVsResolved: { newCount: number; resolved: number }

  // NEW for Scores
  subscores: { label: string; value: number }[]
  scoreDistribution: { label: string; count: number }[]
  cohortPercentile: number | null
  scoreMovers: { up: number; down: number }

  // NEW for Crawl Health
  crawl: {
    lastRunAt: number | null
    durationMs: number | null
    pagesCrawled: number
    pagesDiscovered: number
    throughputPerSec: number | null
    errorBreakdown: { label: string; count: number }[]
    blockedBreakdown: { label: string; count: number }[]
    sitemapParity: { inBoth: number; crawlOnly: number; sitemapOnly: number }
    renderMix: { static: number; ssr: number; csr: number }
  }

  // NEW for Integrations
  integrations: { name: string; connected: boolean; lastSyncAt: number | null }[]
  coverage: { withGsc: number; withKw: number; withBacklinks: number; total: number }
  missingAdapters: string[]
}

