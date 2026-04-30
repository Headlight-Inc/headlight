// services/right-sidebar/fullAudit.types.ts
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type IssueCategory = 'Content' | 'Tech' | 'Schema' | 'Links' | 'A11y' | 'Security'

export type AdapterId =
  | 'gsc' | 'bing' | 'gbp' | 'backlinks' | 'keywords'
  | 'contentInventory' | 'aiRouter' | 'mcpClients'

export interface FullAuditStats {
  // ---- Tab: Overview ---------------------------------------------------
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

  // ---- Tab: Issues -----------------------------------------------------
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

  // ---- Tab: Scores -----------------------------------------------------
  scores: {
    overall: number
    overallDelta: number | null
    subscores: { axis: IssueCategory; value: number }[]
    cohort: { percentile: number; label: string } | null
    pageDistribution: { label: string; value: number }[]
    movers: { up: number; down: number }
  }

  // ---- Tab: Crawl Health ----------------------------------------------
  crawl: {
    lastFinishedAt: number | null
    durationMs: number | null
    pagesCrawled: number
    pagesDiscovered: number
    pagesPerSec: number | null
    avgResponseMs: number | null
    p90ResponseMs: number | null
    p99ResponseMs: number | null
    errors: { total: number; timeouts: number; http5xx: number; parse: number; dns: number }
    blocked: { total: number; robots: number; meta: number; http403: number }
    sitemapParity: {
      inSitemapAndCrawl: number
      inCrawlOnly: number
      inSitemapOnly: number
      total: number
    }
    renderSample: {
      sampled: number
      total: number
      staticPct: number
      ssrPct: number
      csrPct: number
    } | null
  }

  // ---- Tab: Integrations ----------------------------------------------
  integrations: {
    adapters: {
      id: AdapterId
      label: string
      connected: boolean
      lastSyncAt: number | null
      detail?: string
    }[]
    freshness: { id: AdapterId; label: string; description: string }[]
    coverage: { label: string; value: number }[]
    missing: { id: string; label: string }[]
  }
}
