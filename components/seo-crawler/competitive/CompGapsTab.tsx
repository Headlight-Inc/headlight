import React, { useMemo, useState } from 'react';
import { FileText, Link2, Search } from 'lucide-react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import type { CompetitorProfile } from '../../../services/CompetitorMatrixConfig';
import { analyzeCompetitorOverlap } from '../../../services/CompetitorDiscoveryService';
import { findKeywordGaps } from '../../../services/KeywordDiscoveryService';
import GapList from './shared/GapList';
import { CARD, SECTION_HEADER_WITH_MARGIN, SUBTAB_ACTIVE, SUBTAB_BASE, SUBTAB_INACTIVE } from './shared/styles';

type SubTab = 'keywords' | 'content' | 'links';
const PINNED_KEYWORDS_STORAGE_KEY = 'headlight:pinned-keywords';

function profilePages(profile: CompetitorProfile): Array<{ url: string; title: string }> {
  return [...(profile.topOrganicPages || []), ...(profile.topBlogPages || [])]
    .filter((p) => p?.url)
    .map((p) => ({ url: p.url, title: p.title || '' }));
}

export default function CompGapsTab() {
  const [subTab, setSubTab] = useState<SubTab>('keywords');
  const [pinnedKeywords, setPinnedKeywords] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(PINNED_KEYWORDS_STORAGE_KEY);
      return new Set(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  const { competitiveState, pages, setCompetitiveViewMode } = useSeoCrawler();
  const { ownProfile, competitorProfiles, activeCompetitorDomains } = competitiveState;

  const activeComps = useMemo(
    () => activeCompetitorDomains.map((d) => competitorProfiles.get(d)).filter(Boolean) as CompetitorProfile[],
    [activeCompetitorDomains, competitorProfiles]
  );

  const compPages = useMemo(() => activeComps.flatMap((comp) => profilePages(comp)), [activeComps]);

  const keywordGaps = useMemo(() => {
    if (!pages || pages.length === 0) return [];
    return findKeywordGaps(pages, compPages);
  }, [pages, compPages]);

  const contentGaps = useMemo(() => {
    if (!pages || pages.length === 0 || compPages.length === 0) {
      return { commonKeywords: [] as string[], uniqueKeywords: [] as string[] };
    }

    const unique = new Set<string>();
    const common = new Set<string>();
    activeComps.forEach((comp) => {
      const overlap = analyzeCompetitorOverlap(pages, profilePages(comp));
      overlap.uniqueKeywords.forEach((k) => unique.add(k));
      overlap.commonKeywords.forEach((k) => common.add(k));
    });
    return { commonKeywords: [...common], uniqueKeywords: [...unique] };
  }, [pages, compPages, activeComps]);

  const linkGaps = useMemo(() => {
    if (!ownProfile || activeComps.length === 0) return null;

    const yourRD = Number(ownProfile.referringDomains || 0);
    const compAvgRD = activeComps.reduce((sum, c) => sum + Number(c.referringDomains || 0), 0) / activeComps.length;
    const gap = Math.round(compAvgRD - yourRD);
    const yourUR = Number(ownProfile.urlRating || 0);
    const compAvgUR = activeComps.reduce((sum, c) => sum + Number(c.urlRating || 0), 0) / activeComps.length;

    return {
      yourRD,
      compAvgRD: Math.round(compAvgRD),
      gap,
      yourUR,
      compAvgUR: Math.round(compAvgUR),
    };
  }, [ownProfile, activeComps]);

  const intentDistribution = useMemo(() => {
    const yourIntents: Record<string, number> = {
      informational: 0,
      commercial: 0,
      transactional: 0,
      navigational: 0,
    };
    const theirIntents: Record<string, number> = {
      informational: 0,
      commercial: 0,
      transactional: 0,
      navigational: 0,
    };

    pages?.forEach((p: any) => {
      const intent = (p.searchIntent || 'informational').toLowerCase();
      if (intent in yourIntents) yourIntents[intent] += 1;
    });

    keywordGaps.forEach((g) => {
      const intent = (g.intent || 'informational').toLowerCase();
      if (intent in theirIntents) theirIntents[intent] += 1;
    });

    const yourTotal = Object.values(yourIntents).reduce((a, b) => a + b, 0) || 1;
    const theirTotal = Object.values(theirIntents).reduce((a, b) => a + b, 0) || 1;

    return ['informational', 'commercial', 'transactional', 'navigational'].map((intent) => ({
      intent,
      yourPct: Math.round((yourIntents[intent] / yourTotal) * 100),
      theirPct: Math.round((theirIntents[intent] / theirTotal) * 100),
    }));
  }, [pages, keywordGaps]);

  const avgOf = (key: keyof CompetitorProfile) => {
    const vals = activeComps.map((c) => Number(c[key] || 0)).filter((v) => Number.isFinite(v) && v > 0);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };

  const togglePin = (keyword: string) => {
    setPinnedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      localStorage.setItem(PINNED_KEYWORDS_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const subTabs: Array<{ id: SubTab; label: string; icon: React.ReactNode }> = [
    { id: 'keywords', label: 'Keywords', icon: <Search size={12} /> },
    { id: 'content', label: 'Content', icon: <FileText size={12} /> },
    { id: 'links', label: 'Links', icon: <Link2 size={12} /> },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex gap-1 border-b border-[#222] p-2">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`${SUBTAB_BASE} ${subTab === t.id ? SUBTAB_ACTIVE : SUBTAB_INACTIVE}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pt-4">
        {subTab === 'keywords' && (
          <>
            <div className={CARD}>
              <div className={SECTION_HEADER_WITH_MARGIN}>Keyword Universe</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="font-mono text-[18px] font-black text-white">{contentGaps.commonKeywords.length}</div>
                  <div className="text-[9px] uppercase text-[#666]">Shared</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[18px] font-black text-green-400">{pages?.filter((p: any) => p.mainKeyword).length || 0}</div>
                  <div className="text-[9px] uppercase text-[#666]">Your Unique</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[18px] font-black text-red-400">{keywordGaps.length}</div>
                  <div className="text-[9px] uppercase text-red-400/60">Gaps</div>
                </div>
              </div>
            </div>

            <div className={CARD}>
              <div className={SECTION_HEADER_WITH_MARGIN}>Keyword Gaps ({keywordGaps.length})</div>
              <div className="custom-scrollbar max-h-[300px] space-y-1 overflow-y-auto">
                {keywordGaps.slice(0, 15).map((gap, i) => (
                  <div key={`${gap.keyword}-${i}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#111]">
                    <button
                      onClick={() => togglePin(gap.keyword)}
                      className={`shrink-0 text-[12px] ${pinnedKeywords.has(gap.keyword) ? 'text-[#F5364E]' : 'text-[#333] hover:text-[#666]'}`}
                      title={pinnedKeywords.has(gap.keyword) ? 'Unpin keyword' : 'Pin keyword'}
                    >
                      {pinnedKeywords.has(gap.keyword) ? '★' : '☆'}
                    </button>
                    <span className="flex-1 truncate text-[11px] text-white">{gap.keyword}</span>
                    {gap.intent && (
                      <span className="rounded bg-[#111] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#888]">{gap.intent.slice(0, 4)}</span>
                    )}
                    {gap.volume != null && <span className="font-mono text-[10px] text-[#666]">{gap.volume.toLocaleString()}</span>}
                    {gap.position != null && <span className="font-mono text-[10px] text-[#F5364E]">#{gap.position}</span>}
                  </div>
                ))}
              </div>
              {keywordGaps.length > 15 && (
                <button
                  onClick={() => setCompetitiveViewMode('landscape')}
                  className="w-full py-2 text-center text-[10px] font-bold text-[#F5364E] transition-colors hover:text-white"
                >
                  View all {keywordGaps.length} gaps in Keywords view →
                </button>
              )}
            </div>

            <div className={CARD}>
              <div className={SECTION_HEADER_WITH_MARGIN}>Intent Breakdown</div>
              <div className="space-y-2">
                {intentDistribution.map((item) => (
                  <div key={item.intent}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] capitalize text-[#888]">{item.intent}</span>
                      <span className="text-[10px] text-[#555]">You {item.yourPct}% · Them {item.theirPct}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
                        <div className="h-full rounded-full bg-[#F5364E]" style={{ width: `${item.yourPct}%` }} />
                      </div>
                      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
                        <div className="h-full rounded-full bg-[#6366f1]" style={{ width: `${item.theirPct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {subTab === 'content' && (
          <>
            <div className={CARD}>
              <div className={SECTION_HEADER_WITH_MARGIN}>Content Comparison</div>
              <div className="space-y-1.5">
                <div className="border-b border-[#1a1a1e] pb-1 text-[9px] uppercase text-[#555] flex items-center">
                  <span className="flex-1">Metric</span>
                  <span className="w-[60px] text-right">You</span>
                  <span className="w-[60px] text-right">Avg</span>
                  <span className="w-[24px]" />
                </div>
                {[
                  { label: 'Total Pages', yours: ownProfile?.totalIndexablePages, avg: avgOf('totalIndexablePages') },
                  { label: 'Posts/Month', yours: ownProfile?.blogPostsPerMonth, avg: avgOf('blogPostsPerMonth') },
                  {
                    label: 'Avg Words/Page',
                    yours: ownProfile?.avgContentLength || ownProfile?.avgWordsPerArticle,
                    avg: avgOf('avgContentLength') || avgOf('avgWordsPerArticle'),
                  },
                  { label: 'Topic Breadth', yours: ownProfile?.topicCoverageBreadth, avg: avgOf('topicCoverageBreadth') },
                  { label: 'Content Freshness', yours: ownProfile?.contentFreshnessScore, avg: avgOf('contentFreshnessScore'), unit: '%' },
                  { label: 'Schema Coverage', yours: ownProfile?.schemaCoveragePct, avg: avgOf('schemaCoveragePct'), unit: '%' },
                  { label: 'FAQ/How-To Pages', yours: ownProfile?.faqHowToCount, avg: avgOf('faqHowToCount') },
                ].map((row) => {
                  const yours = Number(row.yours || 0);
                  const avg = Number(row.avg || 0);
                  const winning = yours >= avg;
                  return (
                    <div key={row.label} className="flex items-center text-[11px]">
                      <span className="flex-1 text-[#888]">{row.label}</span>
                      <span className="w-[60px] text-right font-mono text-white">{yours.toLocaleString()}{row.unit || ''}</span>
                      <span className="w-[60px] text-right font-mono text-[#666]">{avg.toLocaleString()}{row.unit || ''}</span>
                      <span className={`w-[24px] text-right text-[10px] ${winning ? 'text-green-400' : 'text-red-400'}`}>{winning ? '✓' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={CARD}>
              <div className={SECTION_HEADER_WITH_MARGIN}>Topic Gaps ({contentGaps.uniqueKeywords.length})</div>
              <GapList
                items={contentGaps.uniqueKeywords.slice(0, 10).map((kw) => ({ keyword: kw }))}
                emptyMessage="No content topic gaps detected."
              />
              {contentGaps.uniqueKeywords.length > 10 && (
                <div className="mt-2 text-center text-[10px] text-[#555]">+{contentGaps.uniqueKeywords.length - 10} more topics</div>
              )}
            </div>
          </>
        )}

        {subTab === 'links' && (
          <>
            {!linkGaps && <div className="py-8 text-center text-[11px] text-[#555]">No link data available yet.</div>}
            {linkGaps && (
              <>
                <div className={CARD}>
                  <div className={SECTION_HEADER_WITH_MARGIN}>Backlink Gap</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#888]">Your Referring Domains</span>
                      <span className="font-mono text-[14px] font-bold text-white">{linkGaps.yourRD.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#888]">Competitor Avg RD</span>
                      <span className="font-mono text-[14px] font-bold text-white">{linkGaps.compAvgRD.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-[#222]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#888]">Gap</span>
                      <span className={`font-mono text-[16px] font-black ${linkGaps.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {linkGaps.gap > 0 ? '+' : ''}
                        {linkGaps.gap.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={CARD}>
                  <div className={SECTION_HEADER_WITH_MARGIN}>Link Velocity (60 days)</div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#888]">Your new RD</span>
                    <span className="font-mono text-[14px] font-bold text-white">+{Number(ownProfile?.linkVelocity60d || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#888]">Competitor Avg new RD</span>
                    <span className="font-mono text-[14px] font-bold text-white">
                      +{Math.round(activeComps.reduce((sum, c) => sum + Number(c.linkVelocity60d || 0), 0) / Math.max(1, activeComps.length))}
                    </span>
                  </div>
                </div>

                <div className={CARD}>
                  <div className={SECTION_HEADER_WITH_MARGIN}>URL Rating Comparison</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <div className="font-mono text-[20px] font-black text-white">{linkGaps.yourUR}</div>
                      <div className="text-[9px] uppercase text-[#666]">You</div>
                    </div>
                    <div className="text-[12px] text-[#333]">vs</div>
                    <div className="flex-1 text-center">
                      <div className={`font-mono text-[20px] font-black ${linkGaps.compAvgUR > linkGaps.yourUR ? 'text-red-400' : 'text-green-400'}`}>
                        {linkGaps.compAvgUR}
                      </div>
                      <div className="text-[9px] uppercase text-[#666]">Comp Avg</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
