import { useMemo, useState, useEffect } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { analyzeCompetitorOverlap } from '../../../../services/CompetitorDiscoveryService';
import { findKeywordGaps } from '../../../../services/KeywordDiscoveryService';
import { getCompetitorAlerts, getRankShiftAlerts } from '../../../../services/CrawlerBridgeService';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingUp, ShieldAlert, Zap } from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

export default function CompetitorBattlefieldView() {
  const { ownProfile, competitorProfiles, analysisPages, activeProject } = useSeoCrawler();
  const [selectedCompIdx, setSelectedCompIdx] = useState(0);
  const [compAlerts, setCompAlerts] = useState<any[]>([]);
  const [rankAlerts, setRankAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!activeProject?.id) return;
    getCompetitorAlerts(activeProject.id).then(setCompAlerts);
    getRankShiftAlerts(activeProject.id).then(setRankAlerts);
  }, [activeProject?.id]);

  // Get competitor pages from Dexie (stored during micro-crawl).
  // For now we use the overlap analysis which works on title-level keyword extraction.
  const overlaps = useMemo(() => {
    return competitorProfiles.map(comp => {
      // We can't access raw competitor pages here easily (they're in separate Dexie sessions),
      // so we use the profile-level data. The battlefield uses GSC keyword positions when available.
      return {
        domain: comp.domain,
        sharedKeywords: 0, // Will be computed from GSC data
        yourWins: 0,
        theirWins: 0,
      };
    });
  }, [competitorProfiles]);

  // Build scatter data from your pages with GSC data (you vs. competitor keyword positions)
  // Since we don't have direct competitor keyword positions in current data model,
  // we show your keyword universe as a scatter: position vs. impressions
  const scatterData = useMemo(() => {
    return analysisPages
      .filter(p => p.gscPosition > 0 && p.gscImpressions > 0)
      .map(p => ({
        url: p.url,
        keyword: p.mainKeyword || p.title?.substring(0, 40) || p.url,
        position: p.gscPosition,
        impressions: p.gscImpressions,
        clicks: p.gscClicks || 0,
        opportunity: p.opportunityScore || 0,
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 200);
  }, [analysisPages]);

  // Keyword gaps against all competitors (from title-level extraction)
  const keywordGaps = useMemo(() => {
    if (competitorProfiles.length === 0) return [];
    // Use the profile's topBlogPages and topOrganicPages as proxy for competitor pages
    const competitorFakePages = competitorProfiles.flatMap(comp => [
      ...(comp.topBlogPages || []).map(p => ({ ...p, url: p.url || '' })),
      ...(comp.topOrganicPages || []).map(p => ({ ...p, url: p.url || '' })),
    ]);
    return findKeywordGaps(analysisPages, competitorFakePages).slice(0, 30);
  }, [analysisPages, competitorProfiles]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-[#0a0a0a]">
      {/* Scatter: Your Keyword Universe */}
      <div className="rounded-xl border border-[#1a1a1e] bg-[#0d0d0f] p-4 mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#666] mb-1">
          Your Keyword Battlefield — Position vs. Impressions
        </h3>
        <p className="text-[10px] text-[#555] mb-3">
          Each dot is one of your ranking keywords. Size = clicks. Color = opportunity score (red = high opportunity).
        </p>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <XAxis
              type="number" dataKey="position" name="Position"
              domain={[1, 50]} reversed
              tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
              label={{ value: '← Better Position', position: 'insideBottom', fill: '#555', fontSize: 10, offset: -5 }}
            />
            <YAxis
              type="number" dataKey="impressions" name="Impressions"
              tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
              label={{ value: 'Impressions →', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }}
            />
            <ZAxis type="number" dataKey="clicks" range={[20, 400]} name="Clicks" />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }}
              formatter={(value: any, name: string) => {
                if (name === 'Position') return [`#${value}`, name];
                return [typeof value === 'number' ? value.toLocaleString() : value, name];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.keyword || ''}
            />
            <ReferenceLine x={3} stroke="#F5364E" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine x={10} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.2} />
            <Scatter data={scatterData}>
              {scatterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.opportunity > 60 ? '#F5364E' : entry.opportunity > 30 ? '#F59E0B' : '#3B82F6'}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-[#666]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5364E]" /> High opportunity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Medium opportunity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Stable</span>
        </div>
      </div>

      {/* Keyword Gaps Table */}
      <div className="rounded-xl border border-[#1a1a1e] bg-[#0d0d0f] p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#666] mb-3">
          Keyword Gaps — What Competitors Cover That You Don't ({keywordGaps.length})
        </h3>
        {keywordGaps.length === 0 ? (
          <p className="text-[12px] text-[#555]">No keyword gaps detected, or competitor data is limited. Add more competitors or wait for enrichment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1a1a1e]">
                  <th className="text-left px-3 py-2 text-[10px] font-bold uppercase text-[#666]">Keyword</th>
                  <th className="text-left px-3 py-2 text-[10px] font-bold uppercase text-[#666]">Intent</th>
                  <th className="text-left px-3 py-2 text-[10px] font-bold uppercase text-[#666]">Confidence</th>
                  <th className="text-left px-3 py-2 text-[10px] font-bold uppercase text-[#666]">Source</th>
                </tr>
              </thead>
              <tbody>
                {keywordGaps.map((gap, i) => (
                  <tr key={i} className="border-b border-[#111] hover:bg-[#0e0e10]">
                    <td className="px-3 py-2 text-white font-medium">{gap.keyword}</td>
                    <td className="px-3 py-2 text-[#888]">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        gap.intent === 'transactional' ? 'bg-green-500/10 text-green-400' :
                        gap.intent === 'commercial' ? 'bg-yellow-500/10 text-yellow-400' :
                        gap.intent === 'navigational' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-[#1a1a1e] text-[#888]'
                      }`}>
                        {gap.intent || 'informational'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#888]">{gap.confidence}</td>
                    <td className="px-3 py-2 text-[#555]">{gap.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Threats & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Competitor Moves */}
        <div className="rounded-xl border border-[#1a1a1e] bg-[#0d0d0f] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <ShieldAlert size={16} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-white">Competitive Intelligence</h3>
              <p className="text-[10px] text-[#555]">Recent moves by tracked competitors</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {compAlerts.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#222] rounded-lg">
                <p className="text-[11px] text-[#444]">No recent competitive moves detected.</p>
              </div>
            ) : (
              compAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1e] hover:border-[#333] transition">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[11px] font-bold text-white">{alert.competitor}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      alert.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between text-[9px] text-[#444]">
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    <button className="text-[#F5364E] hover:underline">View Proof</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rank Guard */}
        <div className="rounded-xl border border-[#1a1a1e] bg-[#0d0d0f] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-white">Rank Guard™ Alerts</h3>
              <p className="text-[10px] text-[#555]">Significant keyword volatility</p>
            </div>
          </div>

          <div className="space-y-3">
            {rankAlerts.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#222] rounded-lg">
                <p className="text-[11px] text-[#444]">Rankings are currently stable.</p>
              </div>
            ) : (
              rankAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1e] hover:border-[#333] transition">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={10} className="text-blue-400" />
                    <span className="text-[11px] font-bold text-white">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-[#888] mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between text-[9px] text-[#444]">
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-400">Stable</span>
                      <button className="text-[#888] hover:text-white">Ignore</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
