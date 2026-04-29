import * as React from 'react'
import { useMemo } from 'react'
import {
  AlertTriangle, ArrowUpRight, Boxes, Database,
  FileText, Link as LinkIcon, Wrench,
} from 'lucide-react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { Card, SectionTitle, Bar, Chip } from '../../shared/primitives'
import { KpiStrip } from '../../shared/charts'
import { RsEmpty } from '../../shared/empty'
import { fmtInt } from '../../shared/format'
import { useAiBlurb } from '../../shared/useAiBlurb'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaSiteStats } from '@/services/WebsiteQualityModeTypes'
import type { ActionGroup, ActionCategory } from '@/services/right-sidebar/wqa/types'
import { computeWqaActionGroups } from '@/services/right-sidebar/wqa/actions'
import { computeWqaForecast } from '@/services/right-sidebar/wqa/forecast'
import { ownerLoad } from '@/services/right-sidebar/wqa/selectors'
import { buildActionsForecastPrompt } from '@/services/right-sidebar/wqa/ai-prompts'

const CAT_META: Record<ActionCategory, { label: string; Icon: React.ElementType }> = {
  technical:   { label: 'Technical',   Icon: Wrench },
  content:     { label: 'Content',     Icon: FileText },
  links:       { label: 'Links',       Icon: LinkIcon },
  structured:  { label: 'Schema',      Icon: Database },
  industry:    { label: 'Industry',    Icon: AlertTriangle },
  ai:          { label: 'AI',          Icon: Boxes },
  performance: { label: 'Performance', Icon: Boxes },
  ux:          { label: 'UX',          Icon: Boxes },
  social:      { label: 'Social',      Icon: Boxes },
  commerce:    { label: 'Commerce',    Icon: Boxes },
}

export function ActionsTab({ stats }: RsTabProps<WqaSiteStats>) {
  const {
    pages, wqaState, wqaFilter, setWqaFilter, wqaFacets, setSelectedPage, domain,
  } = useSeoCrawler()

  if (!pages || pages.length === 0) {
    return <RsEmpty message="No actions yet. Run a crawl + audit." />
  }

  const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general'

  const groups = useMemo<ActionGroup[]>(
    () => (wqaState.actionGroups && wqaState.actionGroups.length
      ? (wqaState.actionGroups as unknown as ActionGroup[])
      : computeWqaActionGroups(pages)),
    [pages, wqaState.actionGroups],
  )

  const byCat = useMemo(() => {
    const m = new Map<ActionCategory, number>()
    for (const g of groups) m.set(g.category, (m.get(g.category) || 0) + g.pageCount)
    const max = Math.max(1, ...m.values())
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count, pct: (count / max) * 100 }))
  }, [groups])

  const sorted = useMemo(
    () => [...groups]
      .sort((a, b) => b.totalEstimatedImpact - a.totalEstimatedImpact || a.avgPriority - b.avgPriority)
      .slice(0, 12),
    [groups],
  )

  const forecast = useMemo(() => computeWqaForecast(pages, industry), [pages, industry])
  const forecastPrompt = useMemo(
    () => buildActionsForecastPrompt(groups, forecast),
    [groups, forecast],
  )
  const fcKey = `${domain}|${forecast.projectedScore}|${forecast.estimatedClickGain}|${groups.length}`
  const { text: forecastBlurb } = useAiBlurb(forecastPrompt, fcKey)

  const owners = useMemo(() => ownerLoad(groups), [groups])
  const ownerMax = Math.max(1, ...owners.map(o => o.pages))

  return (
    <div className="p-3 space-y-3">
      <Card title={<SectionTitle>By priority</SectionTitle>}>
        <div className="grid grid-cols-4 gap-2">
          {(['P0','P1','P2','P3'] as const).map(p => {
            const active = wqaFilter.priority === p
            return (
              <button
                key={p}
                onClick={() => setWqaFilter(prev => ({
                  ...prev,
                  priority: prev.priority === p ? 'all' : p,
                }))}
                className={
                  'rounded-md border p-2 text-left transition-colors ' +
                  (active
                    ? 'border-[#F5364E]/40 bg-[#F5364E]/10'
                    : 'border-white/5 bg-[#0a0a0a] hover:bg-[#111]')
                }
                aria-label={`Filter by priority ${p}`}
              >
                <div className="text-[10px] uppercase tracking-wide text-neutral-500">{p}</div>
                <div className={
                  'text-base font-semibold ' +
                  (p === 'P0' ? 'text-rose-400'
                    : p === 'P1' ? 'text-amber-400'
                    : 'text-white')
                }>
                  {fmtInt(wqaFacets.priorities[p])}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card title={<SectionTitle>By type</SectionTitle>}>
        <div className="space-y-1.5">
          {byCat.map(({ cat, count, pct }) => {
            const meta = CAT_META[cat] || { label: cat, Icon: Boxes }
            const Icon = meta.Icon
            return (
              <div key={cat}>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Icon size={11} className="text-[#888]" />
                    {meta.label}
                  </span>
                  <span>{fmtInt(count)}</span>
                </div>
                <Bar value={pct} />
              </div>
            )
          })}
          {byCat.length === 0 && (
            <div className="text-[11px] text-neutral-500">No actions queued.</div>
          )}
        </div>
      </Card>

      <Card title={<SectionTitle>Top actions</SectionTitle>}>
        <div className="space-y-2">
          {sorted.length === 0 && (
            <div className="text-[11px] text-neutral-500">
              No actions yet. Run Strategic Audit to populate.
            </div>
          )}
          {sorted.map(g => {
            const meta = CAT_META[g.category] || { label: g.category, Icon: Boxes }
            const Icon = meta.Icon
            const activeFilter =
              (g.category === 'technical' && wqaFilter.technicalAction === g.code) ||
              (g.category === 'content'   && wqaFilter.contentAction   === g.code)
            const onFilter = () => {
              if (g.category === 'technical') {
                setWqaFilter(prev => ({
                  ...prev,
                  technicalAction: activeFilter ? 'all' : g.code,
                }))
              } else if (g.category === 'content') {
                setWqaFilter(prev => ({
                  ...prev,
                  contentAction: activeFilter ? 'all' : g.code,
                }))
              }
            }
            return (
              <div
                key={`${g.category}|${g.code}`}
                className="rounded-md border border-white/5 bg-[#0a0a0a] p-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500">
                      <Icon size={11} />
                      <span>{meta.label}</span>
                      <span>·</span>
                      <span>Effort: {g.effort}</span>
                      <Chip tone={g.avgPriority <= 1.5 ? 'bad' : g.avgPriority <= 2.5 ? 'warn' : 'neutral'}>
                        {g.code}
                      </Chip>
                    </div>
                    <div className="mt-0.5 truncate text-[12px] font-medium text-white">
                      {g.action}
                    </div>
                    {g.reason && (
                      <div className="line-clamp-2 text-[11px] text-neutral-500">
                        {g.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onFilter}
                    className="shrink-0 rounded p-1 text-[#888] transition-colors hover:bg-[#111] hover:text-white"
                    title="Filter grid to this action"
                    aria-label="Filter grid to this action"
                  >
                    <ArrowUpRight size={12} />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Pages</div>
                    <div className="text-[12px] text-white">{fmtInt(g.pageCount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">Est. impact</div>
                    <div className="text-[12px] text-white">{fmtInt(g.totalEstimatedImpact)}</div>
                  </div>
                </div>

                {g.pages.slice(0, 3).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {g.pages.slice(0, 3).map(p => {
                      const target = pages.find((pp: any) => pp.url === p.url)
                      return (
                        <button
                          key={p.url}
                          onClick={() => target && setSelectedPage(target)}
                          className="block w-full rounded px-1 py-0.5 text-left hover:bg-[#111]"
                          title={p.url}
                        >
                          <div className="truncate text-[11px] text-neutral-300">
                            {p.pagePath || p.url}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {fmtInt(p.impressions)} impr · pos {p.position?.toFixed(1) || '—'}
                          </div>
                        </button>
                      )
                    })}
                    {g.pageCount > 3 && (
                      <div className="px-1 text-[10px] text-neutral-500">
                        +{g.pageCount - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card title={<SectionTitle>Impact forecast</SectionTitle>}>
        <KpiStrip items={[
          { label: 'Now',         value: `${forecast.currentScore}/100` },
          { label: 'Projected',   value: `${forecast.projectedScore}/100`, tone: 'good' },
          { label: '+Clicks/mo',  value: fmtInt(forecast.estimatedClickGain) },
          { label: 'Confidence',  value: `${forecast.confidence}%` },
        ]} />
        {forecastBlurb && (
          <div className="mt-2 whitespace-pre-line rounded border border-white/5 bg-[#0a0a0a] p-2 text-[11px] text-neutral-300">
            {forecastBlurb}
          </div>
        )}
      </Card>

      <Card title={<SectionTitle>Owner load</SectionTitle>}>
        <div className="space-y-1.5">
          {owners.map(o => (
            <div key={o.owner}>
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span>{o.owner}</span>
                <span>{fmtInt(o.pages)}</span>
              </div>
              <Bar value={(o.pages / ownerMax) * 100} />
            </div>
          ))}
          {owners.length === 0 && (
            <div className="text-[11px] text-neutral-500">No assigned actions.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
