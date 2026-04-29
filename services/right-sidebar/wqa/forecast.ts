import { ForecastService } from '../../ForecastService'
import type { WqaForecast } from './types'

export function computeWqaForecast(pages: any[], industry: any): WqaForecast {
  const f = ForecastService.computeForecast(pages, industry)
  return {
    currentScore: f.currentScore,
    projectedScore: f.projectedScore,
    estimatedClickGain: f.estimatedClickGain,
    confidence: f.confidence,
    breakdown: f.breakdown,
  }
}
