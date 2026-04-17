import React, { useMemo } from 'react';
import type { WqaSiteStats } from '../../../../services/WebsiteQualityModeTypes';
import type { DetectedIndustry } from '../../../../services/SiteTypeDetector';
import GaugeBar from '../charts/GaugeBar';
import { formatCat } from '../wqaUtils';

interface Props {
    pages: any[];
    filteredPages: any[];
    stats: WqaSiteStats | null;
    industry: DetectedIndustry;
    onFilterByCategory?: (category: string) => void;
}

export default function WQAContentTab({
    pages,
    stats,
    industry,
    onFilterByCategory,
}: Props) {
    if (!stats) {
        return (
            <div className="p-8 text-center text-[12px] text-[#555]">
                Run a crawl to see content analysis.
            </div>
        );
    }

    const htmlPages = useMemo(
        () => pages.filter((p) => p.isHtmlPage && p.statusCode === 200),
        [pages],
    );

    // ── Quality score distribution (0–100, 10 buckets) ────────────────────
    const qualityBuckets = useMemo(() => {
        const buckets = Array.from({ length: 10 }, (_, i) => ({
            label: `${i * 10}–${i * 10 + 10}`,
            min: i * 10,
            count: 0,
        }));
        htmlPages.forEach((p) => {
            const s = Number(p.contentQualityScore || 0);
            if (s <= 0) return;
            const idx = Math.min(9, Math.floor(s / 10));
            buckets[idx].count += 1;
        });
        return buckets;
    }, [htmlPages]);

    const maxQualityCount = Math.max(...qualityBuckets.map((b) => b.count), 1);
    const scoredCount = qualityBuckets.reduce((s, b) => s + b.count, 0);

    // ── Quality by page category ───────────────────────────────────────────
    const qualityByCategory = useMemo(() => {
        const cats = Object.keys(stats.pagesByCategory ?? {})
            .filter((c) => (stats.pagesByCategory[c] ?? 0) >= 2)
            .sort((a, b) => (stats.pagesByCategory[b] ?? 0) - (stats.pagesByCategory[a] ?? 0))
            .slice(0, 7);

        return cats
            .map((cat) => {
                const catPages = htmlPages.filter((p) => p.pageCategory === cat);
                if (catPages.length === 0) return null;
                const scored = catPages.filter((p) => Number(p.contentQualityScore || 0) > 0);
                const good = scored.filter((p) => Number(p.contentQualityScore) >= 70).length;
                const fair = scored.filter((p) => {
                    const s = Number(p.contentQualityScore);
                    return s >= 40 && s < 70;
                }).length;
                const poor = scored.filter((p) => Number(p.contentQualityScore) < 40).length;
                return { cat: formatCat(cat), key: cat, total: catPages.length, good, fair, poor };
            })
            .filter(Boolean) as Array<{
                cat: string;
                key: string;
                total: number;
                good: number;
                fair: number;
                poor: number;
            }>;
    }, [htmlPages, stats]);

    // ── Content freshness ─────────────────────────────────────────────────
    const freshness = useMemo(() => {
        const now = Date.now();
        const SIX_MO = 180 * 86_400_000;
        const ONE_YR = 365 * 86_400_000;
        const TWO_YR = 730 * 86_400_000;
        let fresh = 0, aging = 0, stale = 0, ancient = 0, unknown = 0;
        htmlPages.forEach((p) => {
            const raw = p.visibleDate || p.lastModified || p.wpPublishDate;
            if (!raw) { unknown += 1; return; }
            const age = now - new Date(raw as string).getTime();
            if (isNaN(age)) { unknown += 1; return; }
            if (age < SIX_MO)      fresh   += 1;
            else if (age < ONE_YR) aging   += 1;
            else if (age < TWO_YR) stale   += 1;
            else                   ancient += 1;
        });
        return { fresh, aging, stale, ancient, unknown };
    }, [htmlPages]);

    const datedTotal = freshness.fresh + freshness.aging + freshness.stale + freshness.ancient;

    // ── Word count buckets ────────────────────────────────────────────────
    const wordBuckets = useMemo(() => {
        const buckets = [
            { label: '< 100',    min: 0,    max: 100,      count: 0 },
            { label: '100–300',  min: 100,  max: 300,      count: 0 },
            { label: '300–800',  min: 300,  max: 800,      count: 0 },
            { label: '800–1.5k', min: 800,  max: 1500,     count: 0 },
            { label: '1.5k+',    min: 1500, max: Infinity, count: 0 },
        ];
        htmlPages.forEach((p) => {
            const wc = Number(p.wordCount || 0);
            const b  = buckets.find((b) => wc >= b.min && wc < b.max);
            if (b) b.count += 1;
        });
        return buckets;
    }, [htmlPages]);

    const maxWordCount = Math.max(...wordBuckets.map((b) => b.count), 1);

    // ── Schema type breakdown ─────────────────────────────────────────────
    const schemaBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        htmlPages.forEach((p) => {
            (p.schemaTypes ?? []).forEach((t: string) => {
                counts[t] = (counts[t] ?? 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([type, count]) => ({
                type,
                count,
                pct: htmlPages.length > 0 ? Math.round((count / htmlPages.length) * 100) : 0,
            }));
    }, [htmlPages]);

    const noSchemaPct =
        htmlPages.length > 0
            ? Math.round(
                  (htmlPages.filter((p) => !(p.schemaTypes ?? []).length).length /
                      htmlPages.length) *
                      100,
              )
            : 0;

    // ── E-E-A-T ───────────────────────────────────────────────────────────
    const eeat = useMemo(() => {
        const scored = htmlPages.filter((p) => Number(p.eeatScore || 0) > 0);
        if (scored.length === 0) return null;
        const avg = Math.round(
            scored.reduce((s, p) => s + Number(p.eeatScore), 0) / scored.length,
        );
        return { avg, count: scored.length };
    }, [htmlPages]);

    // ── Language / readability ────────────────────────────────────────────
    const langQuality = useMemo(() => {
        const withFlesch   = htmlPages.filter((p) => Number(p.fleschScore  || 0) > 0);
        const spellingPages = htmlPages.filter((p) => Number(p.spellingErrors || 0) > 0).length;
        const grammarPages  = htmlPages.filter((p) => Number(p.grammarErrors  || 0) > 0).length;
        if (withFlesch.length === 0 && spellingPages === 0) return null;
        const avgFlesch =
            withFlesch.length > 0
                ? Math.round(
                      withFlesch.reduce((s, p) => s + Number(p.fleschScore), 0) /
                          withFlesch.length,
                  )
                : null;
        return { avgFlesch, spellingPages, grammarPages };
    }, [htmlPages]);

    // ── Content issues ────────────────────────────────────────────────────
    const issues = useMemo(
        () => ({
            exactDup:     htmlPages.filter((p) => p.exactDuplicate).length,
            nearDup:      htmlPages.filter((p) => Number(p.noNearDuplicates || 0) > 0).length,
            thin:         htmlPages.filter((p) => p.isThinContent).length,
            empty:        htmlPages.filter((p) => Number(p.wordCount || 0) === 0).length,
            stuffing:     htmlPages.filter((p) => p.hasKeywordStuffing).length,
            cannibalized: htmlPages.filter((p) => p.isCannibalized).length,
        }),
        [htmlPages],
    );

    // ── Missing on-page elements ──────────────────────────────────────────
    const missing = useMemo(
        () => ({
            title:   htmlPages.filter((p) => !p.title).length,
            meta:    htmlPages.filter((p) => !p.metaDesc).length,
            h1:      htmlPages.filter((p) => !p.h1_1).length,
            schema:  htmlPages.filter((p) => !(p.schemaTypes ?? []).length).length,
            ogTags:  htmlPages.filter((p) => !p.ogTitle).length,
            altText: htmlPages.filter((p) => Number(p.missingAltImages || 0) > 0).length,
        }),
        [htmlPages],
    );

    return (
        <div className="p-3 space-y-5">

            {/* Quality score distribution */}
            <section>
                <SectionHeader title="Quality Score Distribution" />
                <div className="space-y-0.5">
                    {qualityBuckets.map((b) => {
                        const color =
                            b.min >= 70 ? '#22c55e' : b.min >= 40 ? '#f59e0b' : '#ef4444';
                        return (
                            <div key={b.label} className="flex items-center gap-2 text-[10px]">
                                <span className="text-[#666] w-14 text-right font-mono">{b.label}</span>
                                <div className="flex-1 h-2.5 bg-[#141414] border border-[#222]/50 rounded-sm overflow-hidden">
                                    <div
                                        className="h-full rounded-sm transition-all"
                                        style={{
                                            width: `${(b.count / maxQualityCount) * 100}%`,
                                            backgroundColor: color,
                                        }}
                                    />
                                </div>
                                <span className="text-[#555] w-6 font-mono text-right">{b.count}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3 mt-1.5 text-[9px] text-[#555]">
                    <span><span className="text-green-400">■</span> Good 70+</span>
                    <span><span className="text-yellow-400">■</span> Fair 40–70</span>
                    <span><span className="text-red-400">■</span> Poor &lt;40</span>
                    {scoredCount < htmlPages.length && (
                        <span className="ml-auto text-[#333]">
                            {htmlPages.length - scoredCount} unscored
                        </span>
                    )}
                </div>
            </section>

            {/* Quality by category */}
            {qualityByCategory.length > 0 && (
                <section>
                    <SectionHeader title="Quality by Category" />
                    <div className="space-y-2">
                        {qualityByCategory.map((row) => (
                            <div
                                key={row.key}
                                className={onFilterByCategory ? 'cursor-pointer group' : ''}
                                onClick={() => onFilterByCategory?.(row.key)}
                            >
                                <div className="flex justify-between text-[10px] mb-0.5">
                                    <span
                                        className={
                                            onFilterByCategory
                                                ? 'text-[#888] group-hover:text-white transition-colors'
                                                : 'text-[#888]'
                                        }
                                    >
                                        {row.cat}
                                    </span>
                                    <span className="text-[#555]">{row.total}</span>
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-[#1a1a1a]">
                                    {row.good  > 0 && (
                                        <div
                                            className="bg-green-500"
                                            style={{ width: `${(row.good  / row.total) * 100}%` }}
                                        />
                                    )}
                                    {row.fair  > 0 && (
                                        <div
                                            className="bg-yellow-500"
                                            style={{ width: `${(row.fair  / row.total) * 100}%` }}
                                        />
                                    )}
                                    {row.poor  > 0 && (
                                        <div
                                            className="bg-red-500"
                                            style={{ width: `${(row.poor  / row.total) * 100}%` }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Content freshness */}
            <section>
                <SectionHeader title="Content Freshness" />
                <FreshnessDonut freshness={freshness} datedTotal={datedTotal} />
                {freshness.unknown > 0 && (
                    <p className="mt-1.5 text-[9px] text-[#444]">
                        {freshness.unknown} pages with no date detected
                    </p>
                )}
            </section>

            {/* Word count */}
            <section>
                <SectionHeader title="Word Count" />
                <div className="space-y-1">
                    {wordBuckets.map((b) => (
                        <div key={b.label} className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#888] w-16 text-right">{b.label}</span>
                            <div className="flex-1 h-3 bg-[#141414] border border-[#222]/50 rounded overflow-hidden">
                                <div
                                    className="h-full bg-[#3b82f6] rounded"
                                    style={{ width: `${(b.count / maxWordCount) * 100}%` }}
                                />
                            </div>
                            <span className="text-[#555] w-6 font-mono text-right">{b.count}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* E-E-A-T */}
            {eeat && (
                <section>
                    <SectionHeader title="E-E-A-T" />
                    <GaugeBar label="Overall E-E-A-T" value={eeat.avg} suffix="/100" max={100} />
                    <p className="mt-1 text-[9px] text-[#555]">
                        Scored on {eeat.count} of {htmlPages.length} pages
                    </p>
                    {(industry === 'healthcare' || industry === 'finance') && (
                        <div className="mt-2 text-[9px] text-orange-400 bg-orange-400/5 border border-orange-400/10 rounded p-1.5 leading-relaxed">
                            YMYL industry — E-E-A-T directly affects search rankings
                        </div>
                    )}
                </section>
            )}

            {/* Schema breakdown */}
            <section>
                <SectionHeader title="Schema Coverage" />
                {schemaBreakdown.length > 0 ? (
                    <div className="space-y-1">
                        {schemaBreakdown.map(({ type, count, pct }) => (
                            <div key={type} className="flex items-center gap-2 text-[10px]">
                                <span className="text-[#888] flex-1 truncate">{type}</span>
                                <div className="w-16 h-2 bg-[#1a1a1a] rounded overflow-hidden">
                                    <div
                                        className="h-full bg-[#6366f1] rounded"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-[#555] w-6 font-mono text-right">{count}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-[10px] mt-1 pt-1 border-t border-[#1a1a1a]">
                            <span className="text-[#666]">No schema</span>
                            <span
                                className={`font-mono ${
                                    noSchemaPct > 40 ? 'text-orange-400' : 'text-[#555]'
                                }`}
                            >
                                {noSchemaPct}%
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] text-[#555]">
                        No schema markup detected on any page.
                    </p>
                )}
            </section>

            {/* Readability — only when language data is present */}
            {langQuality && (
                <section>
                    <SectionHeader title="Readability" />
                    <div className="space-y-1.5 text-[10px]">
                        {langQuality.avgFlesch !== null && (
                            <GaugeBar
                                label="Avg. Flesch Score"
                                value={langQuality.avgFlesch}
                                suffix="/100"
                                max={100}
                            />
                        )}
                        <div className="flex justify-between">
                            <span className="text-[#888]">Pages with spelling errors</span>
                            <span
                                className={`font-mono ${
                                    langQuality.spellingPages > 0 ? 'text-orange-400' : 'text-green-400'
                                }`}
                            >
                                {langQuality.spellingPages > 0 ? langQuality.spellingPages : '✓'}
                            </span>
                        </div>
                        {langQuality.grammarPages > 0 && (
                            <div className="flex justify-between">
                                <span className="text-[#888]">Pages with grammar errors</span>
                                <span className="text-orange-400 font-mono">
                                    {langQuality.grammarPages}
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Industry-specific content signals */}
            {stats.industryStats && (
                <IndustryContentSection
                    industry={industry}
                    stats={stats.industryStats}
                />
            )}

            {/* Content issues */}
            <section>
                <SectionHeader title="Content Issues" />
                <div className="space-y-1 text-[10px]">
                    {(
                        [
                            { label: 'Exact duplicates',   count: issues.exactDup,     sev: 'error' },
                            { label: 'Near-duplicates',    count: issues.nearDup,      sev: 'warn'  },
                            { label: 'Thin content',       count: issues.thin,         sev: 'warn'  },
                            { label: 'Empty pages',        count: issues.empty,        sev: 'error' },
                            { label: 'Keyword stuffing',   count: issues.stuffing,     sev: 'warn'  },
                            { label: 'Cannibalized pages', count: issues.cannibalized, sev: 'warn'  },
                        ] as const
                    )
                        .filter((r) => r.count > 0)
                        .map((row) => (
                            <div key={row.label} className="flex justify-between">
                                <span className="text-[#888]">{row.label}</span>
                                <span
                                    className={`font-mono ${
                                        row.sev === 'error' ? 'text-red-400' : 'text-orange-400'
                                    }`}
                                >
                                    {row.count}
                                </span>
                            </div>
                        ))}
                    {Object.values(issues).every((v) => v === 0) && (
                        <p className="text-[#555]">No content issues ✓</p>
                    )}
                </div>
            </section>

            {/* Missing on-page elements */}
            <section>
                <SectionHeader title="Missing Elements" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    {[
                        { label: 'Title',    count: missing.title   },
                        { label: 'Meta',     count: missing.meta    },
                        { label: 'H1',       count: missing.h1      },
                        { label: 'Schema',   count: missing.schema  },
                        { label: 'OG Tags',  count: missing.ogTags  },
                        { label: 'Alt text', count: missing.altText },
                    ].map((row) => (
                        <div key={row.label} className="flex justify-between">
                            <span className="text-[#888]">{row.label}</span>
                            <span
                                className={`font-mono ${
                                    row.count > 0 ? 'text-orange-400' : 'text-green-400'
                                }`}
                            >
                                {row.count > 0 ? row.count : '✓'}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// ─── Freshness donut (inline SVG, no external chart dep) ─────────────────────

function FreshnessDonut({
    freshness,
    datedTotal,
}: {
    freshness: { fresh: number; aging: number; stale: number; ancient: number };
    datedTotal: number;
}) {
    const segments = [
        { key: 'fresh',   label: 'Fresh  < 6mo',  count: freshness.fresh,   color: '#22c55e' },
        { key: 'aging',   label: 'Aging  6–12mo', count: freshness.aging,   color: '#f59e0b' },
        { key: 'stale',   label: 'Stale  1–2yr',  count: freshness.stale,   color: '#f97316' },
        { key: 'ancient', label: 'Old    2yr+',   count: freshness.ancient, color: '#ef4444' },
    ];

    if (datedTotal === 0) {
        return <p className="text-[10px] text-[#555]">No dated pages detected.</p>;
    }

    const CX = 48, CY = 48, R = 36, IR = 22;
    let angle = -Math.PI / 2;

    const arcs = segments
        .map(({ count, color }) => {
            if (count === 0) return null;
            const sweep = (count / datedTotal) * 2 * Math.PI;
            const end   = angle + sweep;
            const large = sweep > Math.PI ? 1 : 0;
            const cos = (a: number) => Math.cos(a);
            const sin = (a: number) => Math.sin(a);
            const d = [
                `M ${CX + R * cos(angle)} ${CY + R * sin(angle)}`,
                `A ${R} ${R} 0 ${large} 1 ${CX + R * cos(end)} ${CY + R * sin(end)}`,
                `L ${CX + IR * cos(end)} ${CY + IR * sin(end)}`,
                `A ${IR} ${IR} 0 ${large} 0 ${CX + IR * cos(angle)} ${CY + IR * sin(angle)}`,
                'Z',
            ].join(' ');
            angle = end;
            return { d, color };
        })
        .filter(Boolean) as Array<{ d: string; color: string }>;

    const freshPct =
        datedTotal > 0 ? Math.round((freshness.fresh / datedTotal) * 100) : 0;

    return (
        <div className="flex items-center gap-4">
            <svg width={96} height={96} viewBox="0 0 96 96" className="flex-shrink-0">
                {arcs.map((arc, i) => (
                    <path key={i} d={arc.d} fill={arc.color} />
                ))}
                <text
                    x={CX}
                    y={CY - 3}
                    textAnchor="middle"
                    fill="#ccc"
                    fontSize="13"
                    fontWeight="700"
                >
                    {freshPct}%
                </text>
                <text
                    x={CX}
                    y={CY + 9}
                    textAnchor="middle"
                    fill="#555"
                    fontSize="7"
                >
                    fresh
                </text>
            </svg>
            <div className="space-y-1.5">
                {segments.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-[10px]">
                        <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[#888] w-20">{s.label}</span>
                        <span className="text-[#555] font-mono w-5 text-right">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Industry-specific content signals ───────────────────────────────────────

type IndustryStats = NonNullable<WqaSiteStats['industryStats']>;

const INDUSTRY_ROWS: Partial<
    Record<
        DetectedIndustry,
        Array<{ key: keyof IndustryStats; label: string; fmt: 'pct' | 'bool' | 'count' | 'danger' }>
    >
> = {
    ecommerce: [
        { key: 'productSchemaCoverage', label: 'Product schema',        fmt: 'pct'    },
        { key: 'reviewSchemaCoverage',  label: 'Review schema',         fmt: 'pct'    },
        { key: 'breadcrumbCoverage',    label: 'Breadcrumbs',           fmt: 'pct'    },
        { key: 'outOfStockIndexed',     label: 'Out-of-stock indexed',   fmt: 'danger' },
    ],
    news: [
        { key: 'articleSchemaCoverage', label: 'Article schema',        fmt: 'pct'  },
        { key: 'authorAttributionRate', label: 'Author attribution',     fmt: 'pct'  },
        { key: 'publishDateRate',       label: 'Publish date visible',   fmt: 'pct'  },
        { key: 'hasNewsSitemap',        label: 'News sitemap',           fmt: 'bool' },
        { key: 'hasRssFeed',            label: 'RSS feed',               fmt: 'bool' },
    ],
    blog: [
        { key: 'articleSchemaCoverage', label: 'Article schema',        fmt: 'pct' },
        { key: 'authorAttributionRate', label: 'Author attribution',     fmt: 'pct' },
        { key: 'publishDateRate',       label: 'Publish date visible',   fmt: 'pct' },
    ],
    local: [
        { key: 'hasLocalSchema',       label: 'Local schema',           fmt: 'bool'  },
        { key: 'napConsistent',        label: 'NAP consistent',          fmt: 'bool'  },
        { key: 'hasGmbLink',           label: 'Google Business link',    fmt: 'bool'  },
        { key: 'serviceAreaPageCount', label: 'Location pages',          fmt: 'count' },
        { key: 'hasEmbeddedMap',       label: 'Embedded map',            fmt: 'bool'  },
    ],
    saas: [
        { key: 'hasPricingPage',     label: 'Pricing page',             fmt: 'bool' },
        { key: 'hasDocsSection',     label: 'Docs section',             fmt: 'bool' },
        { key: 'hasChangelog',       label: 'Changelog',                fmt: 'bool' },
        { key: 'hasStatusPage',      label: 'Status page',              fmt: 'bool' },
        { key: 'hasComparisonPages', label: 'Comparison / vs pages',    fmt: 'bool' },
    ],
    healthcare: [
        { key: 'medicalAuthorRate',    label: 'Medical author',         fmt: 'pct' },
        { key: 'medicalReviewRate',    label: 'Medical reviewer',       fmt: 'pct' },
        { key: 'medicalDisclaimerRate',label: 'Disclaimer present',     fmt: 'pct' },
    ],
    finance: [
        { key: 'financialDisclaimerRate', label: 'Disclaimer present',  fmt: 'pct' },
        { key: 'authorCredentialsRate',   label: 'Author credentials',  fmt: 'pct' },
    ],
    real_estate: [
        { key: 'listingCount',        label: 'Listing pages',           fmt: 'count' },
        { key: 'priceMarkupCoverage', label: 'Price markup',            fmt: 'pct'   },
    ],
    restaurant: [
        { key: 'hasMenuSchema',      label: 'Menu schema',              fmt: 'bool' },
        { key: 'hasReservationLink', label: 'Reservation link',         fmt: 'bool' },
    ],
};

const INDUSTRY_LABEL: Partial<Record<DetectedIndustry, string>> = {
    ecommerce:   'E-commerce',
    news:        'News',
    blog:        'Blog',
    local:       'Local',
    saas:        'SaaS',
    healthcare:  'Healthcare',
    finance:     'Finance',
    real_estate: 'Real Estate',
    restaurant:  'Restaurant',
};

function IndustryContentSection({
    industry,
    stats,
}: {
    industry: DetectedIndustry;
    stats: IndustryStats;
}) {
    const rows = INDUSTRY_ROWS[industry];
    if (!rows || rows.length === 0) return null;

    return (
        <section>
            <SectionHeader title={`${INDUSTRY_LABEL[industry] ?? industry} Signals`} />
            <div className="space-y-1.5">
                {rows.map(({ key, label, fmt }) => {
                    const raw = (stats as any)[key];
                    if (raw === undefined || raw === null) return null;

                    if (fmt === 'bool') {
                        const ok = Boolean(raw);
                        return (
                            <div key={key} className="flex justify-between text-[10px]">
                                <span className="text-[#888]">{label}</span>
                                <span className={ok ? 'text-green-400' : 'text-orange-400'}>
                                    {ok ? '✓' : '✗'}
                                </span>
                            </div>
                        );
                    }

                    if (fmt === 'count') {
                        return (
                            <div key={key} className="flex justify-between text-[10px]">
                                <span className="text-[#888]">{label}</span>
                                <span className="text-[#ccc] font-mono">{Number(raw)}</span>
                            </div>
                        );
                    }

                    if (fmt === 'danger') {
                        const n = Number(raw);
                        return (
                            <div key={key} className="flex justify-between text-[10px]">
                                <span className="text-[#888]">{label}</span>
                                <span className={`font-mono ${n > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {n > 0 ? n : '✓'}
                                </span>
                            </div>
                        );
                    }

                    // pct
                    const pct   = Math.round(Number(raw));
                    const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
                    return (
                        <div key={key} className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#888] flex-1">{label}</span>
                            <div className="w-16 h-1.5 bg-[#1a1a1a] rounded overflow-hidden">
                                <div
                                    className="h-full rounded"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                            </div>
                            <span className="text-[#555] w-8 font-mono text-right">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
    return (
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#888] border-b border-[#222] pb-1 mb-3">
            {title}
        </h4>
    );
}
