import * as React from 'react'
import { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { Card, SectionTitle, StatTile, Bar } from '../../shared/primitives'
import { Histogram, KpiStrip } from '../../shared/charts'
import { RsEmpty } from '../../shared/empty'
import { fmtInt, fmtPct, fmtMs } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaSiteStats } from '@/services/WebsiteQualityModeTypes'
import {
  statusMix, renderMix, ttfbPercentiles,
} from '@/services/right-sidebar/wqa/selectors'

function cwvMix(pages: any[]) {
  let good = 0, ni = 0, poor = 0, unk = 0
  for (const p of pages) {
    const b = String(p.cwvBucket || '').toLowerCase()
    if (b === 'good') good++
    else if (b === 'needs-improvement' || b === 'needs_improvement' || b === 'ni') ni++
    else if (b === 'poor') poor++
    else unk++
  }
  return [
    { name: 'Good',   value: good, tone: '#22c55e' },
    { name: 'Needs',  value: ni,   tone: '#f59e0b' },
    { name: 'Poor',   value: poor, tone: '#fb7185' },
    { name: '—',      value: unk,  tone: '#666' },
  ]
}

function indexabilityCounts(pages: any[]) {
  let indexable = 0, blocked = 0, noindex = 0, redirect = 0
  for (const p of pages) {
    const code = Number(p.statusCode || 0)
    if (p.isBlockedByRobots) blocked++
    else if (p.isNoindex || /noindex/i.test(String(p.metaRobots || ''))) noindex++
    else if (code >= 300 && code < 400) redirect++
    else if (code >= 200 && code < 300) indexable++
  }
  return { indexable, blocked, noindex, redirect }
}

function techRiskCounts(pages: any[]) {
  let orphanValue = 0, longRedirects = 0, mixedContent = 0, brokenCanonical = 0
  for (const p of pages) {
    if (p.isOrphan && Number(p.gscImpressions || 0) > 50) orphanValue++
    if (Number(p.redirectChainLength || 0) > 2) longRedirects++
    if (p.hasMixedContent) mixedContent++
    if (p.canonicalUrl && p.canonicalUrl !== p.url && p.canonicalStatus && Number(p.canonicalStatus) >= 400) brokenCanonical++
  }
  return { orphanValue, longRedirects, mixedContent, brokenCanonical }
}

export function TechTab({ stats }: RsTabProps<WqaSiteStats>) {
  const { pages } = useSeoCrawler()
  if (!pages || pages.length === 0) {
    return <RsEmpty message="No technical data yet." />
  }

  const status = useMemo(() => statusMix(pages), [pages])
  const render = useMemo(() => renderMix(pages), [pages])
  const cwv    = useMemo(() => cwvMix(pages), [pages])
  const ttfb   = useMemo(() => ttfbPercentiles(pages), [pages])
  const idx    = useMemo(() => indexabilityCounts(pages), [pages])
  const risks  = useMemo(() => techRiskCounts(pages), [pages])

  const total = Math.max(1, pages.length)
  const brokenPct = (stats.brokenRate || 0)

  return (
    <div className="p-3 space-y-3">
      <Card>
        <KpiStrip items={[
          { label: 'Indexable', value: fmtInt(idx.indexable) },
          { label: 'Blocked',   value: fmtInt(idx.blocked),  tone: idx.blocked  > 0 ? 'warn' : 'neutral' },
          { label: 'Noindex',   value: fmtInt(idx.noindex) },
          { label: 'Broken %',  value: fmtPct(brokenPct, 1), tone: brokenPct > 0.02 ? 'bad' : 'neutral' },
        ]} />
      </Card>

      <Card title={<SectionTitle>Status mix</SectionTitle>}>
        <Histogram data={status} />
      </Card>

      <Card title={<SectionTitle>Render mix</SectionTitle>}>
        <Histogram data={render} />
      </Card>

      <Card title={<SectionTitle>TTFB percentiles</SectionTitle>}>
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="p50" value={fmtMs(ttfb.p50)} />
          <StatTile
            label="p75"
            value={fmtMs(ttfb.p75)}
            tone={ttfb.p75 > 800 ? 'warn' : 'neutral'}
          />
          <StatTile
            label="p90"
            value={fmtMs(ttfb.p90)}
            tone={ttfb.p90 > 1500 ? 'bad' : ttfb.p90 > 800 ? 'warn' : 'neutral'}
          />
        </div>
      </Card>

      <Card title={<SectionTitle>Core Web Vitals</SectionTitle>}>
        <Histogram data={cwv} />
      </Card>

      <Card title={<SectionTitle>Top tech risks</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Orphans w/ value"
            value={fmtInt(risks.orphanValue)}
            tone={risks.orphanValue > 0 ? 'warn' : 'neutral'}
          />
          <StatTile
            label="Redirect chains > 2"
            value={fmtInt(risks.longRedirects)}
            tone={risks.longRedirects > 0 ? 'warn' : 'neutral'}
          />
          <StatTile
            label="Mixed content"
            value={fmtInt(risks.mixedContent)}
            tone={risks.mixedContent > 0 ? 'bad' : 'neutral'}
          />
          <StatTile
            label="Broken canonical"
            value={fmtInt(risks.brokenCanonical)}
            tone={risks.brokenCanonical > 0 ? 'bad' : 'neutral'}
          />
        </div>
      </Card>

      <Card title={<SectionTitle>Coverage</SectionTitle>}>
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>Indexable</span>
              <span>{fmtPct(idx.indexable / total, 0)}</span>
            </div>
            <Bar value={(idx.indexable / total) * 100} />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>Sitemap</span>
              <span>{fmtPct(stats.sitemapCoverage || 0, 0)}</span>
            </div>
            <Bar value={(stats.sitemapCoverage || 0) * 100} />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>Schema</span>
              <span>{fmtPct(stats.schemaCoverage || 0, 0)}</span>
            </div>
            <Bar value={(stats.schemaCoverage || 0) * 100} />
          </div>
        </div>
      </Card>
    </div>
  )
}
