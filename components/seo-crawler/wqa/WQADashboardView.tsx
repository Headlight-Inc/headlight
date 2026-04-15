import React, { useMemo } from 'react';
import type { WebsiteQualityState, WqaSiteStats, WqaActionGroup } from '../../../services/WebsiteQualityModeTypes';
import { getConversionLabel, getEffectiveIndustry, getConversionValue } from '../../../services/WebsiteQualityModeTypes';
import RadarChart from './charts/RadarChart';
import Treemap from './charts/Treemap';
import WaterfallChart from './charts/WaterfallChart';
import AreaTrendChart from './charts/AreaTrendChart';
import ScatterPlot from './charts/ScatterPlot';
import StackedBarChart from './charts/StackedBarChart';
import HeatmapGrid from './charts/HeatmapGrid';
import FunnelChart from './charts/FunnelChart';
import GaugeBar from './charts/GaugeBar';
import { formatCat, formatCompact, formatIndustryLabel, shortenAction } from './wqaUtils';

interface Props {
  wqaState: WebsiteQualityState;
  pages: any[];
  stats: WqaSiteStats | null;
  actionGroups: WqaActionGroup[];
  aiNarrative: string;
  onFilterByCategory: (category: string) => void;
  onFilterByAction: (action: string) => void;
  onNavigateToGrid: () => void;
}

export default function WQADashboardView({
  wqaState,
  pages,
  stats,
  actionGroups,
  aiNarrative,
  onFilterByCategory,
  onFilterByAction,
  onNavigateToGrid,
}: Props) {
  const industry = getEffectiveIndustry(wqaState);

  if (!stats || pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#666] text-sm bg-[#0a0a0a]">
        Run a crawl to see the dashboard.
      </div>
    );
  }

  const conversionLabel = getConversionLabel(industry);
  const totalConversion = useMemo(() => {
    switch (industry) {
      case 'ecommerce': return stats.totalRevenue;
      case 'news':
      case 'blog': return stats.totalPageviews;
      case 'local': return stats.totalGoalCompletions;
      case 'saas': return stats.totalSubscribers;
      default: return stats.totalGoalCompletions;
    }
  }, [stats, industry]);

  const formatConversion = (v: number) => (industry === 'ecommerce' ? `$${v.toLocaleString()}` : v.toLocaleString());

  const radarData = useMemo(() => [
    { axis: 'Content', value: stats.radarContent },
    { axis: 'SEO', value: stats.radarSeo },
    { axis: 'Authority', value: stats.radarAuthority },
    { axis: 'UX', value: stats.radarUx },
    { axis: 'Search', value: stats.radarSearchPerf },
    { axis: 'Trust', value: stats.radarTrust },
  ], [stats]);

  const treemapData = useMemo(() => {
    const cats = ['product', 'blog_post', 'category', 'landing_page', 'service_page', 'homepage', 'faq_help', 'other'];
    const tierColors: Record<string, string> = { '★★★': '#22c55e', '★★': '#3b82f6', '★': '#f59e0b', '☆': '#333' };

    return cats
      .map((cat) => {
        const catPages = pages.filter((p: any) => p.pageCategory === cat);
        if (catPages.length === 0) return null;
        const tiers: Record<string, number> = { '★★★': 0, '★★': 0, '★': 0, '☆': 0 };
        catPages.forEach((p: any) => {
          const tier = p.pageValueTier || '☆';
          if (tiers[tier] != null) tiers[tier] += 1;
        });
        const dominantTier = Object.entries(tiers).sort((a, b) => b[1] - a[1])[0]?.[0] || '☆';

        return {
          label: formatCat(cat),
          value: catPages.length,
          color: tierColors[dominantTier] || '#333',
          sublabel: `${dominantTier} · ${catPages.length} pg`,
        };
      })
      .filter(Boolean) as Array<{ label: string; value: number; color: string; sublabel: string }>;
  }, [pages]);

  const waterfallSegments = useMemo(
    () => actionGroups
      .filter((g) => g.totalEstimatedImpact > 0)
      .slice(0, 6)
      .map((g) => ({
        label: shortenAction(g.action),
        value: g.totalEstimatedImpact,
        color: g.category === 'technical' ? '#6366f1' : g.category === 'content' ? '#22c55e' : '#f59e0b',
      })),
    [actionGroups]
  );

  const trendData = useMemo(
    () => [{ label: 'Current', value1: stats.totalImpressions, value2: stats.totalClicks }],
    [stats]
  );

  const scatterData = useMemo(
    () => pages
      .filter((p: any) => Number(p.gscPosition || 0) > 0 && Number(p.gscImpressions || 0) > 0)
      .map((p: any) => ({
        x: Number(p.gscPosition),
        y: Number(p.gscCtr || 0) * 100,
        size: Math.max(3, Math.min(18, Math.sqrt(Number(p.gscImpressions || 0)) / 5)),
        color: Number(p.ctrGap || 0) < -0.02 ? '#ef4444' : Number(p.ctrGap || 0) > 0.01 ? '#3b82f6' : '#555',
        label: p.pagePath || p.url,
      }))
      .slice(0, 200),
    [pages]
  );

  const freshnessData = useMemo(() => {
    const cats = ['product', 'blog_post', 'category', 'landing_page', 'service_page'];
    const now = Date.now();
    const sixMo = 180 * 86400000;
    const oneYr = 365 * 86400000;
    const twoYr = 2 * oneYr;

    return cats
      .map((cat) => {
        const catPages = pages.filter((p: any) => p.isHtmlPage && p.pageCategory === cat);
        if (catPages.length === 0) return null;

        let fresh = 0;
        let aging = 0;
        let stale = 0;
        let ancient = 0;

        catPages.forEach((p: any) => {
          const date = p.visibleDate || p.lastModified;
          if (!date) {
            ancient += 1;
            return;
          }
          const age = now - new Date(date).getTime();
          if (age < sixMo) fresh += 1;
          else if (age < oneYr) aging += 1;
          else if (age < twoYr) stale += 1;
          else ancient += 1;
        });

        return {
          label: formatCat(cat),
          segments: [
            { value: fresh, color: '#22c55e', label: 'Fresh' },
            { value: aging, color: '#f59e0b', label: 'Aging' },
            { value: stale, color: '#f97316', label: 'Stale' },
            { value: ancient, color: '#ef4444', label: 'Ancient' },
          ],
        };
      })
      .filter(Boolean) as Array<{ label: string; segments: Array<{ value: number; color: string; label: string }> }>;
  }, [pages]);

  const heatmapData = useMemo(() => {
    const cats = ['product', 'blog_post', 'category', 'landing_page', 'service_page'];
    const col = 'Current';

    const cells = cats
      .map((cat) => {
        const catPages = pages.filter((p: any) => p.isHtmlPage && p.pageCategory === cat);
        if (catPages.length === 0) return null;
        const declining = catPages.filter((p: any) => p.isLosingTraffic).length;
        const growing = catPages.filter((p: any) => Number(p.sessionsDeltaPct || 0) > 0.15).length;
        const total = catPages.length;
        const status = declining / total > 0.3 ? 'declining' : growing / total > 0.3 ? 'growing' : 'flat';
        return { row: formatCat(cat), col, status: status as 'growing' | 'flat' | 'declining' };
      })
      .filter(Boolean) as Array<{ row: string; col: string; status: 'growing' | 'flat' | 'declining' }>;

    return { cells, rows: cells.map((c) => c.row), cols: [col] };
  }, [pages]);

  const funnelSteps = useMemo(() => {
    const htmlPages = pages.filter((p: any) => p.isHtmlPage);
    const withIssues = htmlPages.filter((p: any) => Number(p.issueCount || 0) > 0).length;
    const needAction = pages.filter((p: any) => (p.technicalAction && p.technicalAction !== 'Monitor') || (p.contentAction && p.contentAction !== 'No Action')).length;
    const highImpact = pages.filter((p: any) => Number(p.estimatedImpact || 0) > 50).length;

    return [
      { label: 'Total Pages', value: stats.totalPages },
      { label: 'With Issues', value: withIssues },
      { label: 'Need Action', value: needAction },
      { label: 'High Impact', value: highImpact },
    ];
  }, [pages, stats]);

  const topPages = useMemo(
    () => [...pages]
      .filter((p: any) => p.isHtmlPage && p.statusCode === 200)
      .sort((a: any, b: any) => Number(b.pageValue || 0) - Number(a.pageValue || 0))
      .slice(0, 10)
      .map((p: any) => ({
        url: p.url,
        path: p.pagePath || p.url,
        category: formatCat(p.pageCategory || 'other'),
        sessions: Number(p.ga4Sessions || 0),
        conversion: getConversionValue(p, industry),
        quality: Number(p.contentQualityScore || 0),
        techAction: p.technicalAction || 'Monitor',
        contentAction: p.contentAction || 'No Action',
      })),
    [pages, industry]
  );

  const industryHealthBars = useMemo(() => {
    if (!stats.industryStats) return [] as Array<{ label: string; value: number; suffix?: string }>;
    const data = stats.industryStats;
    const bars: Array<{ label: string; value: number; suffix?: string }> = [];

    if (industry === 'ecommerce') {
      if (data.productSchemaCoverage != null) bars.push({ label: 'Product Schema', value: Math.round(data.productSchemaCoverage) });
      if (data.reviewSchemaCoverage != null) bars.push({ label: 'Review Schema', value: Math.round(data.reviewSchemaCoverage) });
      if (data.breadcrumbCoverage != null) bars.push({ label: 'Breadcrumbs', value: Math.round(data.breadcrumbCoverage) });
    } else if (industry === 'news' || industry === 'blog') {
      if (data.articleSchemaCoverage != null) bars.push({ label: 'Article Schema', value: Math.round(data.articleSchemaCoverage) });
      if (data.authorAttributionRate != null) bars.push({ label: 'Author Attribution', value: Math.round(data.authorAttributionRate) });
      if (data.publishDateRate != null) bars.push({ label: 'Publish Date', value: Math.round(data.publishDateRate) });
    } else if (industry === 'local') {
      bars.push({ label: 'Local Schema', value: data.hasLocalSchema ? 100 : 0, suffix: data.hasLocalSchema ? '✓' : '✗' });
      bars.push({ label: 'NAP Consistent', value: data.napConsistent ? 100 : 0, suffix: data.napConsistent ? '✓' : '✗' });
      bars.push({ label: 'GMB Linked', value: data.hasGmbLink ? 100 : 0, suffix: data.hasGmbLink ? '✓' : '✗' });
    } else if (industry === 'saas') {
      bars.push({ label: 'Pricing Page', value: data.hasPricingPage ? 100 : 0, suffix: data.hasPricingPage ? '✓' : '✗' });
      bars.push({ label: 'Docs Section', value: data.hasDocsSection ? 100 : 0, suffix: data.hasDocsSection ? '✓' : '✗' });
      bars.push({ label: 'Changelog', value: data.hasChangelog ? 100 : 0, suffix: data.hasChangelog ? '✓' : '✗' });
    } else if (industry === 'healthcare') {
      if (data.medicalAuthorRate != null) bars.push({ label: 'Medical Author', value: Math.round(data.medicalAuthorRate) });
      if (data.medicalReviewRate != null) bars.push({ label: 'Medical Review', value: Math.round(data.medicalReviewRate) });
    } else if (industry === 'finance') {
      if (data.financialDisclaimerRate != null) bars.push({ label: 'Disclaimer', value: Math.round(data.financialDisclaimerRate) });
      if (data.authorCredentialsRate != null) bars.push({ label: 'Credentials', value: Math.round(data.authorCredentialsRate) });
    }

    return bars;
  }, [stats.industryStats, industry]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a] p-4 md:p-6">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="Quality Grade" value={wqaState.siteGrade} subvalue={`${wqaState.siteScore}/100`} delta={wqaState.scoreDelta} />
        <StatCard label="Traffic" value={formatCompact(stats.totalSessions)} subvalue="sessions/mo" />
        <StatCard label={conversionLabel} value={formatConversion(totalConversion)} subvalue="/mo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DashCard title="Quality Breakdown">
          <RadarChart data={radarData} size={220} />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {radarData.map((d) => (
              <div key={d.axis} className="text-center">
                <div className="text-[13px] font-bold text-white">{d.value}</div>
                <div className="text-[9px] text-[#666]">{d.axis}</div>
              </div>
            ))}
          </div>
        </DashCard>

        <DashCard title="Pages by Category & Value">
          <Treemap data={treemapData} height={220} onClick={(label) => onFilterByCategory(label.toLowerCase())} />
          <div className="flex items-center gap-3 mt-2">
            <Legend color="#22c55e" label="★★★ High" />
            <Legend color="#3b82f6" label="★★ Medium" />
            <Legend color="#f59e0b" label="★ Low" />
            <Legend color="#333" label="☆ Zero" />
          </div>
        </DashCard>
      </div>

      {waterfallSegments.length > 0 && (
        <DashCard title="Estimated Click Impact by Action" className="mb-4">
          <WaterfallChart baseline={stats.totalClicks} baselineLabel="Current clicks" segments={waterfallSegments} resultLabel="After actions" />
        </DashCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DashCard title="Search Visibility">
          {trendData.length > 1 ? (
            <AreaTrendChart data={trendData} label1="Impressions" label2="Clicks" color1="#6366f1" color2="#F5364E" formatValue={formatCompact} />
          ) : (
            <div className="grid grid-cols-2 gap-3 py-4">
              <MiniStat label="Impressions" value={formatCompact(stats.totalImpressions)} />
              <MiniStat label="Clicks" value={formatCompact(stats.totalClicks)} />
              <MiniStat label="Avg Position" value={stats.avgPosition > 0 ? stats.avgPosition.toFixed(1) : '—'} />
              <MiniStat label="Avg CTR" value={stats.totalImpressions > 0 ? `${((stats.totalClicks / stats.totalImpressions) * 100).toFixed(1)}%` : '—'} />
            </div>
          )}
        </DashCard>

        <DashCard title="CTR vs Position">
          {scatterData.length > 0 ? (
            <>
              <ScatterPlot data={scatterData} xLabel="Position" yLabel="CTR %" height={180} />
              <div className="flex items-center gap-3 mt-1">
                <Legend color="#ef4444" label="Below expected" dot />
                <Legend color="#3b82f6" label="Above expected" dot />
                <Legend color="#555" label="Normal" dot />
              </div>
            </>
          ) : (
            <div className="text-[11px] text-[#666] py-8 text-center">Connect GSC to see CTR data</div>
          )}
        </DashCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DashCard title="Content Freshness">
          {freshnessData.length > 0 ? (
            <StackedBarChart
              data={freshnessData}
              legend={[
                { label: 'Fresh', color: '#22c55e' },
                { label: 'Aging', color: '#f59e0b' },
                { label: 'Stale', color: '#f97316' },
                { label: 'Ancient', color: '#ef4444' },
              ]}
            />
          ) : (
            <div className="text-[11px] text-[#666] py-8 text-center">No date data available</div>
          )}
        </DashCard>

        <DashCard title="Traffic by Category">
          {heatmapData.cells.length > 0 ? (
            <HeatmapGrid data={heatmapData.cells} rows={heatmapData.rows} cols={heatmapData.cols} />
          ) : (
            <div className="text-[11px] text-[#666] py-8 text-center">Connect GA4 to see traffic data</div>
          )}
        </DashCard>
      </div>

      <DashCard title="Issue Funnel" className="mb-4">
        <FunnelChart steps={funnelSteps} />
      </DashCard>

      <DashCard title="Top Pages by Value" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[#666] border-b border-[#1a1a1a]">
                <th className="text-left py-1.5 font-medium">Path</th>
                <th className="text-left py-1.5 font-medium">Category</th>
                <th className="text-right py-1.5 font-medium">Sessions</th>
                <th className="text-right py-1.5 font-medium">{conversionLabel}</th>
                <th className="text-right py-1.5 font-medium">Quality</th>
                <th className="text-left py-1.5 font-medium pl-3">Tech Action</th>
                <th className="text-left py-1.5 font-medium pl-3">Content Action</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((row) => (
                <tr
                  key={row.url}
                  className="border-b border-[#111] hover:bg-[#111] cursor-pointer transition-colors"
                  onClick={() => onFilterByCategory(row.category.toLowerCase())}
                >
                  <td className="py-1.5 text-[#ccc] truncate max-w-[180px]">{row.path}</td>
                  <td className="py-1.5 text-[#888]">{row.category}</td>
                  <td className="py-1.5 text-right text-[#aaa]">{row.sessions.toLocaleString()}</td>
                  <td className="py-1.5 text-right text-[#aaa]">{formatConversion(row.conversion)}</td>
                  <td className="py-1.5 text-right">
                    <span className={row.quality >= 70 ? 'text-green-400' : row.quality >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                      {row.quality || '—'}
                    </span>
                  </td>
                  <td className="py-1.5 pl-3 text-[#888]">{row.techAction === 'Monitor' ? '—' : row.techAction}</td>
                  <td className="py-1.5 pl-3 text-[#888]">{row.contentAction === 'No Action' ? '—' : row.contentAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={onNavigateToGrid} className="mt-2 text-[11px] text-[#F5364E] hover:underline">View all in Grid →</button>
      </DashCard>

      {industryHealthBars.length > 0 && (
        <DashCard title={`${formatIndustryLabel(industry)} Health`} className="mb-4">
          <div className="space-y-2">
            {industryHealthBars.map((bar) => (
              <GaugeBar key={bar.label} label={bar.label} value={bar.value} suffix={bar.suffix || '%'} />
            ))}
          </div>
        </DashCard>
      )}

      {!!aiNarrative && (
        <DashCard title="AI Summary" className="mb-4">
          <div className="text-[12px] text-[#9a9a9a] leading-relaxed">{aiNarrative}</div>
        </DashCard>
      )}

      {actionGroups.length > 0 && (
        <DashCard title="Top Actions" className="mb-4">
          <div className="space-y-2">
            {actionGroups.slice(0, 6).map((group) => (
              <button
                key={`${group.category}:${group.action}`}
                onClick={() => onFilterByAction(group.action)}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded border border-[#222] bg-[#111] hover:bg-[#151515] transition-colors"
              >
                <span className="text-[11px] text-[#ccc] truncate">{group.action}</span>
                <span className="text-[10px] text-green-400 font-mono">+{group.totalEstimatedImpact.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </DashCard>
      )}
    </div>
  );
}

function DashCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[#1a1a1a] bg-[#0d0d0f] overflow-hidden ${className}`}>
      <div className="px-4 pt-3 pb-2 border-b border-[#111]">
        <div className="text-[12px] font-semibold text-[#ccc]">{title}</div>
        {subtitle && <div className="text-[10px] text-[#555] mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value, subvalue, delta }: { label: string; value: string; subvalue: string; delta?: number }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4">
      <div className="text-[24px] font-bold text-white tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] text-[#666]">{subvalue}</span>
        {delta != null && delta !== 0 && (
          <span className={`text-[11px] font-medium ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="text-[10px] text-[#555] mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[18px] font-bold text-white">{value}</div>
      <div className="text-[9px] text-[#666]">{label}</div>
    </div>
  );
}

function Legend({ color, label, dot }: { color: string; label: string; dot?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`${dot ? 'w-2 h-2 rounded-full' : 'w-2.5 h-2.5 rounded-sm'}`} style={{ backgroundColor: color }} />
      <span className="text-[9px] text-[#666]">{label}</span>
    </div>
  );
}
