import * as React from 'react'
import { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { Card, SectionTitle, Bar, Chip, Gauge } from '../../shared/primitives'
import { Histogram, KpiStrip } from '../../shared/charts'
import { RsEmpty } from '../../shared/empty'
import { fmtInt, fmtPct } from '../../shared/format'
import { useAiBlurb } from '../../shared/useAiBlurb'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaSiteStats } from '@/services/WebsiteQualityModeTypes'
import { deriveWqaScore } from '@/services/right-sidebar/wqa/score'
import {
  qualityHistogram,
  pageCategoriesShare,
  decisionCounts,
  categoryKpis,
} from '@/services/right-sidebar/wqa/selectors'
import { buildOverviewInsightPrompt } from '@/services/right-sidebar/wqa/ai-prompts'

export function OverviewTab({ stats }: RsTabProps<WqaSiteStats>) {
  const {
    pages, wqaState, wqaFilter, setWqaFilter, wqaFacets, domain,
  } = useSeoCrawler()

  if (!pages || pages.length === 0) {
    return <RsEmpty message="Run a crawl to populate insights." />
  }

  const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general'
  const language = wqaState.languageOverride || wqaState.detectedLanguage || 'unknown'
  const cms = wqaState.detectedCms

  const { score, grade, p50, p90 } = useMemo(() => deriveWqaScore(stats), [stats])
  const kpis = useMemo(() => categoryKpis(stats, industry), [stats, industry])
  const qHist = useMemo(() => qualityHistogram(pages), [pages])
  const cats = useMemo(() => pageCategoriesShare(stats), [stats])
  const decisions = useMemo(() => decisionCounts(wqaFacets), [wqaFacets])

  const insightPrompt = useMemo(
    () => buildOverviewInsightPrompt({
      domain, industry, language, cms, score, grade, stats,
    }),
    [domain, industry, language, cms, score, grade, stats],
  )
  const cacheKey = `${domain}|${score}|${stats.totalPages}|${industry}`
  const { text: insight } = useAiBlurb(insightPrompt, cacheKey)

  return (
    <div className="p-3 space-y-3">
      <Card>
        <div className="flex items-center gap-3">
          <Gauge value={score} label={grade} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip>{fmtInt(stats.totalPages)} pages</Chip>
              <Chip>{language}</Chip>
              <Chip>{cms || '—'}</Chip>
              <Chip tone="accent">{industry}</Chip>
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              p50 {p50} · p90 {p90}
            </div>
          </div>
        </div>
        {insight && (
          <div className="mt-2 whitespace-pre-line rounded border border-white/5 bg-[#0a0a0a] p-2 text-[11px] text-neutral-300">
            {insight}
          </div>
        )}
      </Card>

      <Card title={<SectionTitle>Category KPIs</SectionTitle>}>
        <KpiStrip items={kpis.map(k => ({ label: k.label, value: k.value }))} />
      </Card>

      <Card title={<SectionTitle>Quality distribution</SectionTitle>}>
        <Histogram data={qHist} />
      </Card>

      <Card title={<SectionTitle>Page categories</SectionTitle>}>
        <div className="space-y-1.5">
          {cats.map(c => (
            <div key={c.name}>
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span className="truncate">{c.name}</span>
                <span>{c.value}%</span>
              </div>
              <Bar value={c.value} />
            </div>
          ))}
          {cats.length === 0 && (
            <div className="text-[11px] text-neutral-500">No categorized pages yet.</div>
          )}
        </div>
      </Card>

      <Card title={<SectionTitle>Search snapshot (30d)</SectionTitle>}>
        <KpiStrip items={[
          { label: 'Clicks',      value: fmtInt(stats.totalClicks) },
          { label: 'Impressions', value: fmtInt(stats.totalImpressions) },
          { label: 'Avg CTR',     value: fmtPct(stats.avgCtr, 2) },
          { label: 'Avg Pos',     value: stats.avgPosition.toFixed(1) },
        ]} />
      </Card>

      <Card title={<SectionTitle>Needs decision</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          {decisions.map(d => {
            const active = wqaFilter.decision === d.key
            return (
              <button
                key={d.key}
                onClick={() => setWqaFilter(prev => ({
                  ...prev,
                  decision: prev.decision === d.key ? 'all' : d.key,
                }))}
                className={
                  'rounded-md border p-2 text-left transition-colors ' +
                  (active
                    ? 'border-[#F5364E]/40 bg-[#F5364E]/10'
                    : 'border-white/5 bg-[#0a0a0a] hover:bg-[#111]')
                }
                aria-label={`Filter by ${d.label}`}
              >
                <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                  {d.label}
                </div>
                <div className="text-base font-semibold text-white">
                  {fmtInt(d.value)}
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
