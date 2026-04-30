// components/seo-crawler/right-sidebar/modes/fullAudit/CrawlHealthTab.tsx
import React from 'react'
import {
  Card, Row, StatTile, Bar, Donut,
  SourceChip, FreshnessChip, SectionTitle, RsPartial,
} from '@/components/seo-crawler/right-sidebar/shared'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { FullAuditStats } from '@/services/right-sidebar/fullAudit.types'

const SRC = { tier: 'scrape', name: 'Crawler' } as const
const fmtInt = (n: number) => n.toLocaleString()
const fmtMs  = (n: number | null) => n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n}ms`

export function FullCrawlHealthTab({ stats }: RsTabProps<FullAuditStats>) {
  const c = stats.crawl

  return (
    <div className="flex flex-col gap-3">
      <Card title="Last crawl" right={<FreshnessChip at={c.lastFinishedAt ?? undefined} />}>
        <Row label="Duration"    value={c.durationMs ? `${(c.durationMs / 1000).toFixed(1)}s` : '—'} />
        <Row label="Pages"       value={`${fmtInt(c.pagesCrawled)} / ${fmtInt(c.pagesDiscovered)}`} />
        <Row label="Throughput"  value={c.pagesPerSec != null ? `${c.pagesPerSec} pg/s` : '—'} />
      </Card>

      <Card title="Response times" right={<SourceChip source={SRC} />}>
        <div className="grid grid-cols-3 gap-1.5">
          <StatTile label="avg" value={fmtMs(c.avgResponseMs)} />
          <StatTile label="p90" value={fmtMs(c.p90ResponseMs)} tone={(c.p90ResponseMs ?? 0) > 1500 ? 'warn' : 'good'} />
          <StatTile label="p99" value={fmtMs(c.p99ResponseMs)} tone={(c.p99ResponseMs ?? 0) > 3000 ? 'bad'  : 'good'} />
        </div>
      </Card>

      <Card title={`Errors · ${c.errors.total}`}>
        <Row label="Timeouts" value={fmtInt(c.errors.timeouts)} tone={c.errors.timeouts ? 'warn' : 'good'} />
        <Row label="5xx"      value={fmtInt(c.errors.http5xx)}  tone={c.errors.http5xx  ? 'bad'  : 'good'} />
        <Row label="Parse"    value={fmtInt(c.errors.parse)}    tone={c.errors.parse    ? 'warn' : 'good'} />
        <Row label="DNS"      value={fmtInt(c.errors.dns)}      tone={c.errors.dns      ? 'warn' : 'good'} />
      </Card>

      <Card title={`Blocked · ${c.blocked.total}`}>
        <Row label="robots.txt" value={fmtInt(c.blocked.robots)}  tone={c.blocked.robots  ? 'warn' : 'good'} />
        <Row label="meta"       value={fmtInt(c.blocked.meta)}    tone={c.blocked.meta    ? 'warn' : 'good'} />
        <Row label="403"        value={fmtInt(c.blocked.http403)} tone={c.blocked.http403 ? 'warn' : 'good'} />
      </Card>

      <Card title="Sitemap parity">
        <Row label="In sitemap & crawl" value={`${fmtInt(c.sitemapParity.inSitemapAndCrawl)} / ${fmtInt(c.sitemapParity.total)}`} />
        <Row label="In crawl only"      value={fmtInt(c.sitemapParity.inCrawlOnly)}   tone={c.sitemapParity.inCrawlOnly   ? 'warn' : 'good'} />
        <Row label="In sitemap only"    value={fmtInt(c.sitemapParity.inSitemapOnly)} tone={c.sitemapParity.inSitemapOnly ? 'warn' : 'good'} />
      </Card>

      {c.renderSample ? (
        <Card title={`Render sample · ${c.renderSample.sampled}/${c.renderSample.total}`}>
          <div className="flex items-center gap-3">
            <Donut segments={[
              { label: 'Static', value: c.renderSample.staticPct, color: '#34d399' },
              { label: 'SSR',    value: c.renderSample.ssrPct,    color: '#60a5fa' },
              { label: 'CSR',    value: c.renderSample.csrPct,    color: '#fbbf24' },
            ]} />
            <div className="flex-1 grid grid-cols-1 gap-1">
              <Row label="Static" value={`${c.renderSample.staticPct}%`} tone="good" />
              <Row label="SSR"    value={`${c.renderSample.ssrPct}%`}    tone="info" />
              <Row label="CSR"    value={`${c.renderSample.csrPct}%`}    tone={c.renderSample.csrPct > 20 ? 'warn' : 'good'} />
            </div>
          </div>
        </Card>
      ) : (
        <RsPartial title="Enable render sampling" reason="No render-mode samples available for this session." />
      )}
    </div>
  )
}
