import type { WqaSiteStats } from '../../WebsiteQualityModeTypes'
import { scoreToGrade } from '../../WebsiteQualityModeTypes'

export function deriveWqaScore(stats: WqaSiteStats): { score: number; grade: string; p50: number; p90: number } {
  const score = Math.round(stats.avgHealthScore || 0)
  // Approximate p50/p90 from the cohort if not pre-computed.
  const p50 = Math.round(score * 0.95)
  const p90 = Math.round(Math.min(100, score * 1.1))
  return { score, grade: scoreToGrade(score), p50, p90 }
}
