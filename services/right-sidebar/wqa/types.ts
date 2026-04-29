export type ActionCategory = 'technical' | 'content' | 'links' | 'structured' | 'ai' | 'performance' | 'ux' | 'social' | 'commerce' | 'industry'
export type ActionPriority = 'P0' | 'P1' | 'P2' | 'P3'
export type Decision = 'rewrite' | 'merge' | 'expand' | 'deprecate' | 'monitor'

export interface ActionGroup {
  code: string
  action: string
  category: ActionCategory
  pageCount: number
  totalEstimatedImpact: number
  avgPriority: number
  reason: string
  effort: 'low' | 'medium' | 'high'
  pages: Array<{
    url: string
    pagePath: string
    pageCategory: string
    impressions: number
    clicks: number
    sessions: number
    position: number
    ctr: number
    estimatedImpact: number
  }>
}

export interface WqaForecast {
  currentScore: number
  projectedScore: number
  estimatedClickGain: number
  confidence: number  // 0..100
  breakdown: { technical: number; content: number; authority: number }
}
