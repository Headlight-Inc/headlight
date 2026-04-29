import * as React from 'react'
import { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { Card, SectionTitle, StatTile, Bar, Row } from '../../shared/primitives'
import { Histogram, KpiStrip } from '../../shared/charts'
import { RsEmpty } from '../../shared/empty'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaSiteStats } from '@/services/WebsiteQualityModeTypes'
import {
  qualityHistogram,
  wordCountDistribution,
} from '@/services/right-sidebar/wqa/selectors'

interface FreshnessMix { fresh: number; aging: number; stale: number; nodate: number }

function computeFreshness(pages: any[]): FreshnessMix {
  const out: FreshnessMix = { fresh: 0, aging: 0, stale: 0, nodate: 0 }
  const now = Date.now()
  for (const p of pages) {
    const t = p.lastModified || p.publishedDate || p.publishDate
    if (!t) { out.nodate++; continue }
    const days = (now - new Date(t).getTime()) / (1000 * 60 * 60 * 24)
    if (Number.isNaN(days)) { out.nodate++; continue }
    if (days <= 90) out.fresh++
    else if (days <= 365) out.aging++
    else out.stale++
  }
  return out
}

function computeReadabilityMix(pages: any[]) {
  let easy = 0, ok = 0, hard = 0, none = 0
  for (const p of pages) {
    const r = Number(p.readabilityScore || 0)
    if (!r) { none++; continue }
    if (r >= 60) easy++
    else if (r >= 30) ok++
    else hard++
  }
  return [
    { name: 'Easy',   value: easy, tone: '#22c55e' },
    { name: 'OK',     value: ok,   tone: '#3b82f6' },
    { name: 'Hard',   value: hard, tone: '#fb7185' },
    { name: 'No data',value: none, tone: '#666' },
  ]
}

export function ContentTab({ stats }: RsTabProps<WqaSiteStats>) {
  const { pages, wqaState } = useSeoCrawler()
  if (!pages || pages.length === 0) {
    return <RsEmpty message="No content data yet." />
  }

  const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general'

  const qHist = useMemo(() => qualityHistogram(pages), [pages])
  const wHist = useMemo(() => wordCountDistribution(pages), [pages])
  const freshness = useMemo(() => computeFreshness(pages), [pages])
  const readability = useMemo(() => computeReadabilityMix(pages), [pages])

  // Industry-specific signals (best-effort — missing fields render as 0/—)
  const eeatRows = useMemo(() => {
    const total = Math.max(1, pages.length)
    const withAuthor = pages.filter((p: any) => Boolean(p.authorName || p.author)).length
    const withByline = pages.filter((p: any) => Boolean(p.bylineDate || p.publishedDate)).length
    const withUpdated = pages.filter((p: any) => Boolean(p.lastModified)).length
    return [
      { label: 'Author byline',   value: withAuthor / total },
      { label: 'Publish date',    value: withByline / total },
      { label: 'Last-updated',    value: withUpdated / total },
    ]
  }, [pages])

  const ecomRows = useMemo(() => {
    const total = Math.max(1, pages.length)
    const productSchema = pages.filter((p: any) => p.hasProductSchema).length
    const reviewSchema  = pages.filter((p: any) => p.hasReviewSchema).length
    const breadcrumbs   = pages.filter((p: any) => p.hasBreadcrumbSchema).length
    return [
      { label: 'Product schema',    value: productSchema / total },
      { label: 'Review schema',     value: reviewSchema / total },
      { label: 'Breadcrumb schema', value: breadcrumbs / total },
    ]
  }, [pages])

  const newsRows = useMemo(() => {
    const total = Math.max(1, pages.length)
    const article = pages.filter((p: any) => p.hasArticleSchema).length
    const author  = pages.filter((p: any) => Boolean(p.authorName || p.author)).length
    return [
      { label: 'Article schema',     value: article / total },
      { label: 'Author attribution', value: author / total },
      { label: 'In news sitemap',    value: stats.newsSitemapCoverage || 0 },
    ]
  }, [pages, stats.newsSitemapCoverage])

  const showEeat = ['news','blog','healthcare','finance'].includes(industry)
  const showEcom = industry === 'ecommerce'
  const showNews = industry === 'news'

  const freshTotal = Math.max(1, freshness.fresh + freshness.aging + freshness.stale + freshness.nodate)

  return (
    <div className="p-3 space-y-3">
      <Card>
        <KpiStrip items={[
          { label: 'Q-avg',       value: Math.round(stats.avgContentQuality || 0) },
          { label: 'EEAT-avg',    value: Math.round(stats.avgEeat || 0) },
          { label: 'Thin %',      value: fmtPct(stats.thinContentRate || 0, 0) },
          { label: 'Duplicate %', value: fmtPct(stats.duplicateRate || 0, 0) },
        ]} />
      </Card>

      <Card title={<SectionTitle>Quality mix</SectionTitle>}>
        <Histogram data={qHist} />
      </Card>

      <Card title={<SectionTitle>Word count</SectionTitle>}>
        <Histogram data={wHist} />
      </Card>

      <Card title={<SectionTitle>Freshness</SectionTitle>}>
        <div className="space-y-1.5">
          {([
            { key: 'fresh',  label: 'Fresh (≤90d)',     tone: 'good' as const },
            { key: 'aging',  label: 'Aging (90–365d)',   tone: 'neutral' as const },
            { key: 'stale',  label: 'Stale (>365d)',     tone: 'warn' as const },
            { key: 'nodate', label: 'No date',           tone: 'neutral' as const },
          ] as const).map(row => {
            const v = freshness[row.key]
            const pct = (v / freshTotal) * 100
            return (
              <div key={row.key}>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>{row.label}</span>
                  <span>{fmtInt(v)}</span>
                </div>
                <Bar value={pct} />
              </div>
            )
          })}
        </div>
      </Card>

      <Card title={<SectionTitle>Readability</SectionTitle>}>
        <Histogram data={readability} />
      </Card>

      <Card title={<SectionTitle>Schema coverage</SectionTitle>}>
        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>Any schema</span>
              <span>{fmtPct(stats.schemaCoverage || 0, 0)}</span>
            </div>
            <Bar value={(stats.schemaCoverage || 0) * 100} />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-neutral-300">
              <span>Sitemap</span>
              <span>{fmtPct(stats.sitemapCoverage || 0, 0)}</span>
            </div>
            <Bar value={(stats.sitemapCoverage || 0) * 100} />
          </div>
        </div>
      </Card>

      {showEeat && (
        <Card title={<SectionTitle>E-E-A-T signals</SectionTitle>}>
          <div className="space-y-1">
            {eeatRows.map(r => (
              <Row
                key={r.label}
                label={<span className="text-neutral-300">{r.label}</span>}
                value={<span className="text-neutral-300">{fmtPct(r.value, 0)}</span>}
              />
            ))}
          </div>
        </Card>
      )}

      {showEcom && (
        <Card title={<SectionTitle>E-commerce signals</SectionTitle>}>
          <div className="space-y-1.5">
            {ecomRows.map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>{r.label}</span>
                  <span>{fmtPct(r.value, 0)}</span>
                </div>
                <Bar value={r.value * 100} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {showNews && (
        <Card title={<SectionTitle>News signals</SectionTitle>}>
          <div className="space-y-1.5">
            {newsRows.map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>{r.label}</span>
                  <span>{fmtPct(r.value, 0)}</span>
                </div>
                <Bar value={r.value * 100} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title={<SectionTitle>Risk counts</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Cannibalization"
            value={fmtInt(stats.cannibalizationCount || 0)}
            tone={(stats.cannibalizationCount || 0) > 0 ? 'warn' : 'neutral'}
          />
          <StatTile
            label="Decay risk"
            value={fmtInt(stats.decayRiskCount || 0)}
            tone={(stats.decayRiskCount || 0) > 0 ? 'warn' : 'neutral'}
          />
          <StatTile label="Orphan w/ value" value={fmtInt(stats.orphanPagesWithValue || 0)} />
          <StatTile label="Striking distance" value={fmtInt(stats.pagesInStrikingDistance || 0)} />
        </div>
      </Card>
    </div>
  )
}
