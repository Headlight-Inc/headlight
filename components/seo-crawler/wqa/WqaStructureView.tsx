import React, { useMemo, useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import { formatCat, formatCompact, tryPath } from './wqaUtils';

// ─── Value tier → fill color ──────────────────────────────────
const TIER_COLOR: Record<string, string> = {
  '★★★': '#22c55e',
  '★★':  '#3b82f6',
  '★':   '#f59e0b',
  '☆':   '#2a2a2a',
};

const SIZE_OPTIONS = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'sessions',    label: 'Sessions'    },
  { value: 'wordCount',   label: 'Word Count'  },
  { value: 'pageCount',   label: 'Page Count'  },
] as const;

type SizeBy = typeof SIZE_OPTIONS[number]['value'];

const ALL_CATEGORIES = [
  'homepage', 'product', 'category', 'blog_post', 'blog_index',
  'landing_page', 'service_page', 'about', 'contact', 'legal',
  'faq', 'resource', 'login', 'media', 'pagination',
  'search_results', 'location_page', 'other',
];

function pageSize(page: any, sizeBy: SizeBy): number {
  switch (sizeBy) {
    case 'impressions':
      return Math.max(1, Number(page.gscImpressions || 0) || Number(page.ga4Sessions || 0) || 1);
    case 'sessions':
      return Math.max(1, Number(page.ga4Sessions || 0) || 1);
    case 'wordCount':
      return Math.max(1, Number(page.wordCount || 0) || 1);
    case 'pageCount':
      return 1;
  }
}

// ─── Custom cell renderer ─────────────────────────────────────
function TreemapCell(props: any) {
  const { x, y, width, height, root, depth, name, tier, onCellClick } = props;

  if (width < 4 || height < 4) return null;

  // depth 0 = root wrapper (invisible), depth 1 = category group, depth 2 = page or tier leaf
  if (depth === 0) return null;

  const color     = TIER_COLOR[tier] || '#222';
  const isGroup   = depth === 1;
  const showLabel = width > 48 && height > 26;
  const showSub   = width > 90 && height > 44 && !isGroup;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        style={{
          fill:         isGroup ? 'transparent' : color,
          fillOpacity:  isGroup ? 0 : 0.16,
          stroke:       isGroup ? '#333' : color,
          strokeWidth:  isGroup ? 1 : 0.8,
          strokeOpacity: isGroup ? 0.5 : 0.45,
          cursor:       'pointer',
        }}
        onClick={() => onCellClick?.(props)}
      />
      {showLabel && (
        <text
          x={x + 7}
          y={y + (isGroup ? 16 : height / 2 - (showSub ? 6 : 0))}
          fill={isGroup ? '#888' : '#fff'}
          fontSize={isGroup ? 9 : Math.min(11, Math.max(8, width / 10))}
          fontWeight={isGroup ? '600' : '500'}
          fontFamily="Inter, system-ui, sans-serif"
          dominantBaseline={isGroup ? 'auto' : 'middle'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {name?.length > 20 ? name.slice(0, 18) + '…' : name}
        </text>
      )}
      {showSub && (
        <text
          x={x + 7}
          y={y + height / 2 + 10}
          fill={color}
          fontSize={8}
          fontFamily="Inter, system-ui, sans-serif"
          dominantBaseline="middle"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {tier}
        </text>
      )}
    </g>
  );
}

// ─── Tooltip content ──────────────────────────────────────────
function StructureTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  if (!d?.name) return null;
  return (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded px-3 py-2 shadow-xl pointer-events-none">
      <div className="text-white text-[11px] font-medium mb-1">{d.name}</div>
      {d.url    && <div className="text-[#777] text-[10px]">{tryPath(d.url)}</div>}
      {d.tier   && <div className="text-[10px] mt-0.5" style={{ color: TIER_COLOR[d.tier] }}>{d.tier}</div>}
      {d.impressions != null && (
        <div className="text-[#666] text-[10px]">{formatCompact(d.impressions)} impr</div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function WqaStructureView() {
  const { filteredPages, setSelectedPage } = useSeoCrawler();
  const [sizeBy, setSizeBy] = useState<SizeBy>('impressions');

  // Build nested treemap data: categories → pages (or tier groups for large categories)
  const treeData = useMemo(() => {
    const catMap: Record<string, any[]> = {};
    for (const cat of ALL_CATEGORIES) catMap[cat] = [];

    for (const page of filteredPages) {
      const cat = page.pageCategory || 'other';
      if (!catMap[cat]) catMap[cat] = ['other'];
      catMap[cat].push(page);
    }

    const groups = Object.entries(catMap)
      .filter(([, pages]) => pages.length > 0)
      .map(([cat, pages]) => {
        const GROUP_THRESHOLD = 40;
        const children =
          pages.length > GROUP_THRESHOLD
            ? // Collapse into tier sub-groups
              (['★★★', '★★', '★', '☆'] as const).map((tier) => {
                const tierPages = pages.filter((p) => (p.pageValueTier || '☆') === tier);
                if (tierPages.length === 0) return null;
                return {
                  name:        `${tier} (${tierPages.length})`,
                  size:        tierPages.reduce((s, p) => s + pageSize(p, sizeBy), 0),
                  tier,
                  pageCount:   tierPages.length,
                  impressions: tierPages.reduce((s, p) => s + Number(p.gscImpressions || 0), 0),
                  catPages:    tierPages,
                };
              }).filter(Boolean)
            : // One cell per page
              pages.map((page) => ({
                name:        tryPath(page.url).split('/').filter(Boolean).pop() || '/',
                size:        pageSize(page, sizeBy),
                tier:        page.pageValueTier || '☆',
                url:         page.url,
                impressions: Number(page.gscImpressions || 0),
                page,
              }));

        // Dominant tier = majority tier of pages in this category
        const tierCount: Record<string, number> = {};
        for (const p of pages) {
          const t = p.pageValueTier || '☆';
          tierCount[t] = (tierCount[t] || 0) + 1;
        }
        const dominantTier = Object.entries(tierCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '☆';

        return {
          name:      formatCat(cat),
          cat,
          tier:      dominantTier,
          pageCount: pages.length,
          children:  children as any[],
        };
      })
      .sort((a, b) => b.pageCount - a.pageCount);

    return [{ name: 'root', children: groups }];
  }, [filteredPages, sizeBy]);

  const handleCellClick = (props: any) => {
    if (props?.page) {
      setSelectedPage(props.page);
    } else if (Array.isArray(props?.catPages) && props.catPages.length > 0) {
      // Pick highest-value page in this tier group
      const sorted = [...props.catPages].sort(
        (a, b) => Number(b.gscImpressions || 0) - Number(a.gscImpressions || 0),
      );
      setSelectedPage(sorted[0]);
    }
  };

  // Bottom bar: category pill list
  const catSummary = useMemo(() => {
    const catMap: Record<string, { count: number; tier: string }> = {};
    for (const page of filteredPages) {
      const cat  = formatCat(page.pageCategory || 'other');
      const tier = page.pageValueTier || '☆';
      if (!catMap[cat]) catMap[cat] = { count: 0, tier };
      catMap[cat].count++;
    }
    return Object.entries(catMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 14);
  }, [filteredPages]);

  if (filteredPages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] text-[#555] text-[12px]">
        No pages match the current filter.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1a1a1a] bg-[#0d0d0d] flex-shrink-0">
        <span className="text-[11px] text-[#555]">{filteredPages.length} pages</span>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-[#444] uppercase tracking-wider">Size by</span>
          <select
            value={sizeBy}
            onChange={(e) => setSizeBy(e.target.value as SizeBy)}
            className="bg-[#111] border border-[#222] text-[11px] text-[#ccc] rounded px-2 py-1 outline-none cursor-pointer hover:border-[#333]"
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {Object.entries(TIER_COLOR).map(([tier, color]) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: color, opacity: 0.65 }} />
              <span className="text-[10px] text-[#555]">{tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Treemap ─────────────────────────────────────────── */}
      <div className="flex-1 p-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            aspectRatio={16 / 9}
            isAnimationActive={false}
            content={<TreemapCell onCellClick={handleCellClick} />}
          >
            <Tooltip content={<StructureTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* ── Category summary bar ─────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-x-4 gap-y-1 flex-wrap px-4 py-2
                      border-t border-[#1a1a1a] bg-[#0d0d0d] overflow-x-auto">
        {catSummary.map(([cat, { count, tier }]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-[2px] flex-shrink-0"
              style={{ backgroundColor: TIER_COLOR[tier] || '#333', opacity: 0.6 }}
            />
            <span className="text-[10px] text-[#555] whitespace-nowrap">{cat}</span>
            <span className="text-[10px] text-[#383838]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
