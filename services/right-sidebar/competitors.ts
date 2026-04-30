import type { RsDataDeps, RsModeBundle, RsAction } from './types'
import { CompOverviewTab, CompSharedGapsTab, CompWinsTab, CompLossesTab, CompOverlapTab } from '../../components/seo-crawler/right-sidebar/modes/competitors'

export interface CompetitorsStats {
  source: 'connected' | 'partial' | 'none'
  competitors: ReadonlyArray<{ domain: string; visibility: number; deltaPct: number }>
  overview: { tracked: number; sov: number | null; rankWins: number; rankLosses: number; backlinkOverlapPct: number | null }
  sharedGaps: { keywords: ReadonlyArray<{ keyword: string; volume: number; competitorsRanking: number; ourPosition: number | null }>; contentGaps: number }
  wins: { keywordsWon: ReadonlyArray<{ keyword: string; oldPos: number; newPos: number; delta: number }>; topMovers: ReadonlyArray<{ keyword: string; delta: number }> }
  losses: { keywordsLost: ReadonlyArray<{ keyword: string; oldPos: number; newPos: number; delta: number }>; topDeclines: ReadonlyArray<{ keyword: string; delta: number }> }
  overlap: { sharedDomains: ReadonlyArray<{ domain: string; competitorCount: number; ourLink: boolean }>; uniqueToCompetitors: number; uniqueToUs: number }
  actions: ReadonlyArray<RsAction>
  fetchedAt?: string
}

export function computeCompetitorsStats(deps: RsDataDeps): CompetitorsStats {
  const conn = deps.integrationConnections ?? {}
  const ah = conn.ahrefs, sm = conn.semrush
  const sum = ((ah ?? sm)?.summary?.competitors ?? {}) as any
  const source: CompetitorsStats['source'] = (ah || sm) ? 'connected' : 'none'

  const actions: RsAction[] = []
  if ((sum.sharedGapsCount ?? 0) > 0) actions.push({ id: 'gaps',  label: `Target ${sum.sharedGapsCount} shared gaps`, severity: 'highLeverage', effort: 'med', impact: 70 })
  if ((sum.rankLosses ?? 0) > (sum.rankWins ?? 0)) actions.push({ id: 'losses', label: 'Investigate rank losses', severity: 'highLeverage', effort: 'med', impact: 60 })
  if ((sum.uniqueLinksToCompetitors ?? 0) > 50) actions.push({ id: 'links', label: 'Outreach to common backlink targets', severity: 'strategic', effort: 'high', impact: 50 })

  return {
    source,
    competitors: sum.list ?? [],
    overview: {
      tracked:           (sum.list ?? []).length,
      sov:               sum.shareOfVoice ?? null,
      rankWins:          sum.rankWins   ?? 0,
      rankLosses:        sum.rankLosses ?? 0,
      backlinkOverlapPct:sum.overlapPct ?? null,
    },
    sharedGaps: { keywords: sum.sharedGaps ?? [], contentGaps: sum.contentGaps ?? 0 },
    wins:       { keywordsWon: sum.keywordsWon ?? [], topMovers:   sum.topWinners ?? [] },
    losses:     { keywordsLost: sum.keywordsLost ?? [], topDeclines: sum.topLosers ?? [] },
    overlap:    { sharedDomains: sum.sharedDomains ?? [], uniqueToCompetitors: sum.uniqueLinksToCompetitors ?? 0, uniqueToUs: sum.uniqueLinksToUs ?? 0 },
    actions,
    fetchedAt: (ah ?? sm)?.lastFetchedAt,
  }
}

export const competitorsBundle: RsModeBundle<CompetitorsStats> = {
  mode: 'competitors', accent: 'red', defaultTabId: 'comp_overview',
  tabs: [
    { id: 'comp_overview', label: 'Overview',         Component: CompOverviewTab },
    { id: 'comp_shared',   label: 'Shared Gaps',      Component: CompSharedGapsTab },
    { id: 'comp_wins',     label: 'Wins',             Component: CompWinsTab },
    { id: 'comp_losses',   label: 'Losses',           Component: CompLossesTab },
    { id: 'comp_overlap',  label: 'Backlink Overlap', Component: CompOverlapTab },
  ],
  computeStats: computeCompetitorsStats,
}
