import React from 'react';
import { Clock, AlertTriangle, ShieldOff, FileCode, Layers } from 'lucide-react';
import { useFaSidebarData } from '../../../../services/FaSidebarData';
import {
    Card, StatTile, BarMini, StackedBar, EmptyHint,
    fmtNumber, fmtDuration, fmtPct, fmtRelativeTime, type Tone,
} from '../shared';

export default function FaCrawlTab() {
    const { crawl } = useFaSidebarData();

    if (!crawl.last.startedAt && crawl.sessions.length === 0) {
        return <EmptyHint title="No crawls yet" sub="Start a crawl from the header to populate live and historical metrics." />;
    }

    const renderSegments: Array<{ label: string; value: number; tone: Tone }> = [
        { label: 'Static', value: crawl.renderSample.staticPct,   tone: 'good' },
        { label: 'SSR',    value: crawl.renderSample.ssrPct,      tone: 'info' },
        { label: 'CSR',    value: crawl.renderSample.csrPct,      tone: 'warn' },
    ];

    return (
        <div className="space-y-3">
            <Card title="Last crawl">
                <div className="grid grid-cols-2 gap-2">
                    <StatTile label="Duration" value={fmtDuration(crawl.last.durationSec * 1000)} sub={fmtRelativeTime(crawl.last.startedAt)} />
                    <StatTile label="Pages" value={fmtNumber(crawl.last.pagesCrawled)} sub={`of ${fmtNumber(crawl.last.pagesPlanned)} planned`} />
                </div>
            </Card>

            <Card title="Throughput">
                <div className="text-[11px] text-[#aaa] mb-2">
                    <span className="text-white font-mono tabular-nums text-[14px]">{crawl.throughput.perSec.toFixed(1)}</span>
                    <span className="ml-1 text-[#777]">pages/sec average</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                        <div className="text-[9px] uppercase tracking-widest text-[#666]">p50</div>
                        <div className="text-[12px] font-mono text-white tabular-nums">{fmtDuration(crawl.throughput.p50Ms)}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                        <div className="text-[9px] uppercase tracking-widest text-[#666]">p90</div>
                        <div className="text-[12px] font-mono text-white tabular-nums">{fmtDuration(crawl.throughput.p90Ms)}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                        <div className="text-[9px] uppercase tracking-widest text-[#666]">p99</div>
                        <div className="text-[12px] font-mono text-white tabular-nums">{fmtDuration(crawl.throughput.p99Ms)}</div>
                    </div>
                </div>
            </Card>

            <Card title="Errors">
                {crawl.errors.total === 0 ? (
                    <div className="text-[11px] text-green-400">No errors.</div>
                ) : (
                    <ul className="space-y-1 text-[11px]">
                        <li className="flex justify-between"><span className="text-[#aaa]">Timeouts</span><span className="font-mono text-white tabular-nums">{fmtNumber(crawl.errors.timeouts)}</span></li>
                        <li className="flex justify-between"><span className="text-[#aaa]">5xx</span><span className="font-mono text-red-400 tabular-nums">{fmtNumber(crawl.errors.serverErrors)}</span></li>
                        <li className="flex justify-between"><span className="text-[#aaa]">Parse errors</span><span className="font-mono text-white tabular-nums">{fmtNumber(crawl.errors.parseErrors)}</span></li>
                        <li className="flex justify-between"><span className="text-[#aaa]">DNS</span><span className="font-mono text-white tabular-nums">{fmtNumber(crawl.errors.dns)}</span></li>
                    </ul>
                )}
            </Card>

            <Card title="Blocked">
                {crawl.blocked.total === 0 ? (
                    <div className="text-[11px] text-[#888]">Nothing blocked.</div>
                ) : (
                    <ul className="space-y-1 text-[11px]">
                        <li className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[#aaa]"><ShieldOff size={11} className="text-orange-400" /> robots.txt</span>
                            <span className="font-mono text-white tabular-nums">{fmtNumber(crawl.blocked.robots)}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[#aaa]"><FileCode size={11} className="text-orange-400" /> meta noindex</span>
                            <span className="font-mono text-white tabular-nums">{fmtNumber(crawl.blocked.meta)}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[#aaa]"><AlertTriangle size={11} className="text-orange-400" /> 403</span>
                            <span className="font-mono text-white tabular-nums">{fmtNumber(crawl.blocked.http403)}</span>
                        </li>
                    </ul>
                )}
            </Card>

            <Card title="Sitemap parity">
                {crawl.sitemap.totalUrls === 0 ? (
                    <EmptyHint title="No sitemap discovered" sub="Add a sitemap URL in Crawl settings to enable parity tracking." />
                ) : (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <StatTile label="In sitemap" value={fmtNumber(crawl.sitemap.totalUrls)} sub={`${crawl.sitemap.sources.length} sources`} />
                            <StatTile label="Matched" value={fmtNumber(crawl.sitemap.matched)} sub={`${fmtPct(crawl.sitemap.matched / Math.max(1, crawl.sitemap.totalUrls))}`} />
                        </div>
                        <BarMini label="Missing from crawl" value={crawl.sitemap.missingFromCrawl} max={Math.max(1, crawl.sitemap.totalUrls)} count={crawl.sitemap.missingFromCrawl} tone="bad" />
                        <BarMini label="Missing from sitemap" value={crawl.sitemap.missingFromSitemap} max={Math.max(1, crawl.sitemap.totalUrls)} count={crawl.sitemap.missingFromSitemap} tone="warn" />
                    </div>
                )}
            </Card>

            <Card title="Render sample">
                {crawl.renderSample.sampled === 0 ? (
                    <div className="text-[11px] text-[#888]">No render-mode sampling on this crawl.</div>
                ) : (
                    <>
                        <div className="text-[11px] text-[#888] mb-2 flex items-center gap-1.5">
                            <Layers size={11} className="text-blue-400" />
                            <span className="font-mono text-white tabular-nums">{fmtNumber(crawl.renderSample.sampled)}</span> pages sampled
                        </div>
                        <StackedBar segments={renderSegments.map((s) => ({ ...s, value: Math.round(s.value * 100) }))} />
                    </>
                )}
            </Card>

            <Card title="Recent sessions" noPadding>
                {crawl.sessions.length === 0 ? (
                    <div className="p-2.5 text-[11px] text-[#666]">No prior sessions.</div>
                ) : (
                    <ul className="divide-y divide-[#222]">
                        {crawl.sessions.map((s) => (
                            <li key={s.id} className="flex items-center gap-2 text-[11px] py-1.5 px-2.5 hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                                <Clock size={10} className="text-[#666]" />
                                <span className="text-[#ddd] truncate flex-1">{s.label}</span>
                                <span className="font-mono text-[#888] tabular-nums">{fmtNumber(s.pageCount)}</span>
                                <span className="font-mono text-[#888] tabular-nums w-10 text-right">{s.score || '—'}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
