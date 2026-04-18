import React, { useMemo } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeWqaSiteStats } from '../../../../services/WqaSidebarData';
import { Bar, Card, Row, SectionTitle, StatTile, fmtInt, fmtPct, fmtScore, scoreTone } from './shared';
import SchemaTypeDonut from '../charts/SchemaTypeDonut';

export default function WqaContentTab() {
    const { pages, wqaState, wqaFilter, setWqaFilter, setSelectedPage } = useSeoCrawler();
    const industry = wqaState.industryOverride || wqaState.detectedIndustry || 'general';
    const stats = useMemo(() => computeWqaSiteStats(pages || [], industry as any), [pages, industry]);

    const thinPages = useMemo(() => (pages || [])
        .filter((p) => p.isHtmlPage && Number(p.statusCode) === 200 && Number(p.wordCount || 0) > 0 && Number(p.wordCount) < 300)
        .sort((a, b) => Number(a.wordCount || 0) - Number(b.wordCount || 0))
        .slice(0, 5), [pages]);

    const decaying = useMemo(() => (pages || [])
        .filter((p) => Number(p.contentDecayRisk || 0) > 40)
        .sort((a, b) => Number(b.contentDecayRisk || 0) - Number(a.contentDecayRisk || 0))
        .slice(0, 5), [pages]);

    const dupes = useMemo(() => (pages || [])
        .filter((p) => p.exactDuplicate || p.isDuplicate || Number(p.noNearDuplicates || 0) > 0)
        .sort((a, b) => Number(b.noNearDuplicates || 0) - Number(a.noNearDuplicates || 0))
        .slice(0, 5), [pages]);

    const aging = useMemo(() => (pages || [])
        .filter((p) => p.contentAge === 'aging' && Number(p.gscClicks || 0) > 0)
        .sort((a, b) => Number(b.gscClicks || 0) - Number(a.gscClicks || 0))
        .slice(0, 5), [pages]);

    const schemaBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of pages || []) {
            const types = Array.isArray(p.schemaTypes) ? p.schemaTypes : [];
            for (const t of types) counts[t] = (counts[t] || 0) + 1;
        }
        return Object.entries(counts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [pages]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5">
                <StatTile label="Content score"  value={fmtScore(stats.avgContentQuality)} tone={scoreTone(stats.avgContentQuality)} />
                <StatTile label="E-E-A-T"        value={fmtScore(stats.avgEeat)}           tone={scoreTone(stats.avgEeat)} />
                <StatTile label="Thin content"   value={fmtPct(stats.thinContentRate, 1)}  tone={stats.thinContentRate > 20 ? 'bad' : 'neutral'} />
                <StatTile label="Duplicate"      value={fmtPct(stats.duplicateRate, 1)}    tone={stats.duplicateRate > 10 ? 'warn' : 'neutral'} />
            </div>

            <Card>
                <SectionTitle title="Structural quality" />
                <Row label="Schema coverage" value={fmtPct(stats.schemaCoverage, 1)}
                     tone={stats.schemaCoverage >= 80 ? 'good' : stats.schemaCoverage >= 40 ? 'warn' : 'bad'} />
                <Row label="Avg word count"  value={fmtInt(pages?.length ? Math.round(pages.reduce((s, p) => s + Number(p.wordCount || 0), 0) / pages.length) : 0)} />
                <Row label="Orphan rate"     value={fmtPct(stats.orphanRate, 1)}
                     tone={stats.orphanRate > 15 ? 'warn' : 'neutral'} />
                <button onClick={() => setWqaFilter({ ...wqaFilter, contentAge: 'stale' })} className="w-full mt-2">
                    <Row label="Decay risk pages" value={fmtInt(stats.decayRiskCount)} hint="Age + traffic loss + position drop" tone={stats.decayRiskCount > 0 ? 'warn' : 'neutral'} />
                </button>
            </Card>

            {schemaBreakdown.length > 0 && (
                <Card>
                    <SectionTitle title="Schema types" hint={`${schemaBreakdown.length} types`} />
                    <div className="flex items-center gap-3">
                        <SchemaTypeDonut data={schemaBreakdown} size={120} />
                        <div className="flex-1 space-y-0.5">
                            {schemaBreakdown.slice(0, 6).map((s) => (
                                <Row key={s.label} label={s.label} value={fmtInt(s.value)} />
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {thinPages.length > 0 && (
                <div>
                    <SectionTitle title="Thinnest pages" />
                    <Card pad={false}>
                        {thinPages.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] mt-0.5">
                                    <span className="text-red-400 font-bold">{fmtInt(p.wordCount)} words</span>
                                    {p.title && <span className="ml-2">{String(p.title).slice(0, 40)}</span>}
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {dupes.length > 0 && (
                <div>
                    <SectionTitle title="Duplicate clusters" />
                    <Card pad={false}>
                        {dupes.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] mt-0.5 flex items-center gap-3">
                                    <span className="text-orange-400 font-bold">{fmtInt(p.noNearDuplicates || (p.exactDuplicate ? 1 : 0))} dup(s)</span>
                                    {p.canonical && <span>canon {String(p.canonical).slice(-30)}</span>}
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {aging.length > 0 && (
                <div>
                    <SectionTitle title="Aging pages with traffic" hint="refresh candidates" />
                    <Card pad={false}>
                        {aging.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] mt-0.5 flex items-center gap-3">
                                    <span>{fmtInt(p.gscClicks)} clicks</span>
                                    <span>{p.visibleDate || '—'}</span>
                                </div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}

            {decaying.length > 0 && (
                <div>
                    <SectionTitle title="Decay risk" />
                    <Card pad={false}>
                        {decaying.map((p) => (
                            <button key={p.url} onClick={() => setSelectedPage(p)} className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors">
                                <div className="text-[11px] font-mono text-blue-400 truncate">{p.url}</div>
                                <div className="text-[10px] text-[#888] mt-0.5 flex items-center gap-3">
                                    <span className="text-orange-400 font-bold">Risk {fmtScore(p.contentDecayRisk)}</span>
                                    <span>{p.contentAge || '—'}</span>
                                </div>
                                <div className="mt-1"><Bar pct={Number(p.contentDecayRisk || 0)} tone="warn" /></div>
                            </button>
                        ))}
                    </Card>
                </div>
            )}
        </div>
    );
}
