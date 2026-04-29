import * as React from 'react'
import { useMemo } from 'react'
import { useSeoCrawler } from '@/contexts/SeoCrawlerContext'
import { Card, SectionTitle, StatTile, Row } from '../../shared/primitives'
import { KpiStrip, Histogram, ScatterPlot } from '../../shared/charts'
import { RsEmpty } from '../../shared/empty'
import { fmtInt, fmtPct } from '../../shared/format'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { WqaSiteStats } from '@/services/WebsiteQualityModeTypes'
import {
  positionHistogram, ctrVsBenchmark, topLosers, quickWins,
} from '@/services/right-sidebar/wqa/selectors'

type SearchStatus = 'all' | 'top3' | 'page1' | 'striking' | 'weak' | 'none'
type TrafficStatus = 'all' | 'growing' | 'stable' | 'declining' | 'none'

export function SearchTab({ stats }: RsTabProps<WqaSiteStats>) {
  const {
    pages, wqaFilter, setWqaFilter, wqaFacets, setSelectedPage,
  } = useSeoCrawler()

  if (!pages || pages.length === 0) {
    return <RsEmpty message="No search data yet." />
  }

  const scatter = useMemo(
    () => pages
      .filter((p: any) =>
        Number(p.gscImpressions || 0) > 50 &&
        Number(p.gscPosition || 0) > 0 &&
        Number(p.gscPosition || 0) <= 50,
      )
      .slice(0, 200)
      .map((p: any) => ({
        x: Number(p.gscPosition),
        y: Number(p.gscCtr || 0) * 100,
        url: p.url,
      })),
    [pages],
  )

  const posHist = useMemo(() => positionHistogram(pages), [pages])
  const ctrBench = useMemo(() => ctrVsBenchmark(pages), [pages])
  const losers = useMemo(() => topLosers(pages, 5), [pages])
  const wins = useMemo(() => quickWins(pages, 5), [pages])

  const setSearch = (v: SearchStatus) =>
    setWqaFilter(prev => ({
      ...prev,
      searchStatus: prev.searchStatus === v ? 'all' : v,
    }))
  const setTraffic = (v: TrafficStatus) =>
    setWqaFilter(prev => ({
      ...prev,
      trafficStatus: prev.trafficStatus === v ? 'all' : v,
    }))

  return (
    <div className="p-3 space-y-3">
      <Card>
        <KpiStrip items={[
          { label: 'Clicks',      value: fmtInt(stats.totalClicks) },
          { label: 'Impressions', value: fmtInt(stats.totalImpressions) },
          { label: 'Avg CTR',     value: fmtPct(stats.avgCtr, 2) },
          { label: 'Avg Pos',     value: stats.avgPosition.toFixed(1) },
        ]} />
      </Card>

      {scatter.length > 0 && (
        <Card title={<SectionTitle>Position × CTR</SectionTitle>}>
          <ScatterPlot data={scatter} xLabel="Position" yLabel="CTR %" />
        </Card>
      )}

      <Card title={<SectionTitle>Position distribution</SectionTitle>}>
        <Histogram data={posHist} />
      </Card>

      {ctrBench.length > 0 && (
        <Card title={<SectionTitle>CTR vs benchmark</SectionTitle>}>
          <div className="space-y-1">
            {ctrBench.map(b => (
              <Row
                key={b.pos}
                label={<span className="text-neutral-300">Pos {b.pos}</span>}
                value={
                  <span className="text-neutral-300">
                    <span className={b.actual >= b.expected ? 'text-emerald-400' : 'text-rose-400'}>
                      {(b.actual * 100).toFixed(2)}%
                    </span>
                    <span className="text-neutral-500"> / {(b.expected * 100).toFixed(2)}%</span>
                  </span>
                }
              />
            ))}
          </div>
        </Card>
      )}

      <Card title={<SectionTitle>Ranking distribution</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSearch('top3')} className="text-left" aria-label="Top 3">
            <StatTile label="Top 3" value={fmtInt(wqaFacets.searchStatuses.top3)} tone="good" />
          </button>
          <button onClick={() => setSearch('page1')} className="text-left" aria-label="Page 1">
            <StatTile label="Page 1" value={fmtInt(wqaFacets.searchStatuses.page1)} />
          </button>
          <button onClick={() => setSearch('striking')} className="text-left" aria-label="Striking distance">
            <StatTile label="Striking 4–20" value={fmtInt(wqaFacets.searchStatuses.striking)} tone="warn" />
          </button>
          <button onClick={() => setSearch('weak')} className="text-left" aria-label="Weak">
            <StatTile label="Weak 21+" value={fmtInt(wqaFacets.searchStatuses.weak)} />
          </button>
          <button onClick={() => setSearch('none')} className="col-span-2 text-left" aria-label="No impressions">
            <StatTile
              label="No impressions"
              value={fmtInt(wqaFacets.searchStatuses.none)}
              tone={wqaFacets.searchStatuses.none > 0 ? 'warn' : 'neutral'}
            />
          </button>
        </div>
      </Card>

      <Card title={<SectionTitle>Traffic trend</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setTraffic('growing')} className="text-left" aria-label="Growing">
            <StatTile label="Growing" value={fmtInt(wqaFacets.trafficStatuses.growing)} tone="good" />
          </button>
          <button onClick={() => setTraffic('stable')} className="text-left" aria-label="Stable">
            <StatTile label="Stable" value={fmtInt(wqaFacets.trafficStatuses.stable)} />
          </button>
          <button onClick={() => setTraffic('declining')} className="text-left" aria-label="Declining">
            <StatTile
              label="Declining"
              value={fmtInt(wqaFacets.trafficStatuses.declining)}
              tone={wqaFacets.trafficStatuses.declining > 0 ? 'bad' : 'neutral'}
            />
          </button>
          <button onClick={() => setTraffic('none')} className="text-left" aria-label="No traffic">
            <StatTile label="No traffic" value={fmtInt(wqaFacets.trafficStatuses.none)} />
          </button>
        </div>
      </Card>

      {losers.length > 0 && (
        <Card title={<SectionTitle>Biggest traffic drops</SectionTitle>}>
          <div className="space-y-0.5">
            {losers.map((p: any) => (
              <button
                key={p.url}
                onClick={() => setSelectedPage(p)}
                className="block w-full rounded px-2 py-1 text-left hover:bg-[#111]"
                title={p.url}
              >
                <div className="truncate text-[11px] text-neutral-300">{p.url}</div>
                <div className="text-[10px] text-neutral-500">
                  <span className="text-rose-400">
                    {Number(p.sessionsDeltaPct || 0).toFixed(0)}%
                  </span>{' '}· {fmtInt(p.gscClicks)} clicks · pos {Number(p.gscPosition || 0).toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {wins.length > 0 && (
        <Card title={<SectionTitle>Quick wins</SectionTitle>}>
          <div className="space-y-0.5">
            {wins.map((p: any) => (
              <button
                key={p.url}
                onClick={() => setSelectedPage(p)}
                className="block w-full rounded px-2 py-1 text-left hover:bg-[#111]"
                title={p.url}
              >
                <div className="truncate text-[11px] text-neutral-300">{p.url}</div>
                <div className="text-[10px] text-neutral-500">
                  pos {Number(p.gscPosition).toFixed(1)} · {fmtInt(p.gscImpressions)} impr · CTR {(Number(p.gscCtr || 0) * 100).toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card title={<SectionTitle>Coverage gap</SectionTitle>}>
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Sitemap cov." value={fmtPct(stats.sitemapCoverage, 0)} />
          <StatTile
            label="Zero-impr indexable"
            value={fmtInt(stats.pagesWithZeroImpressions)}
            tone={stats.pagesWithZeroImpressions > 0 ? 'warn' : 'neutral'}
          />
        </div>
      </Card>
    </div>
  )
}
