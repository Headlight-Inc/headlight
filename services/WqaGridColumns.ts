// Shared cell-level helpers for the WQA Grid view.
// Keeps WqaGridView lean and avoids touching MainDataView's giant cell branch.

export const ACTION_KIND_BY_COL: Record<string, 'technical' | 'content' | 'industry' | 'monitor'> = {
    technicalAction: 'technical',
    contentAction:   'content',
    industryAction:  'industry',
    primaryAction:   'monitor', // tinted by primaryActionCategory at render time
};

export const WQA_COLUMN_PRESETS: Array<{ id: string; label: string; columns: string[] }> = [
    {
        id: 'default',
        label: 'Default',
        columns: [
            'pageCategory', 'url', 'statusCode', 'indexabilityStatus',
            'pageValueTier', 'primaryAction', 'estimatedImpact', 'actionPriority',
            'gscClicks', 'gscImpressions', 'gscPosition', 'ctrGap',
            'ga4Sessions', 'sessionsDeltaPct',
            'backlinks', 'inlinks',
            'contentAge', 'healthScore', 'issueCount',
        ],
    },
    {
        id: 'search',
        label: 'Search-focused',
        columns: [
            'url', 'pageCategory', 'mainKeyword', 'mainKwPosition',
            'gscClicks', 'gscImpressions', 'gscCtr', 'expectedCtr', 'ctrGap',
            'searchIntent', 'intentMatch', 'isCannibalized',
            'sessionsDeltaPct', 'primaryAction',
        ],
    },
    {
        id: 'quality',
        label: 'Quality-focused',
        columns: [
            'url', 'pageCategory', 'pageValueTier', 'healthScore',
            'contentQualityScore', 'eeatScore', 'wordCount', 'contentAge',
            'issueCount', 'contentAction',
        ],
    },
    {
        id: 'tech',
        label: 'Tech-focused',
        columns: [
            'url', 'pageCategory', 'statusCode', 'indexabilityStatus',
            'speedScore', 'healthScore', 'issueCount',
            'inSitemap', 'internalPageRank', 'technicalAction',
        ],
    },
];

import { WQA_METRICS } from './WqaMetricCatalog';

export function getWqaColumnPreset(id: string) {
    return WQA_COLUMN_PRESETS.find((p) => p.id === id) || WQA_COLUMN_PRESETS[0];
}

/**
 * Dev-time validation to ensure presets don't drift from the canonical catalog.
 */
export function validateColumnPresets(): { valid: boolean; missing: string[] } {
  const catalogKeys = new Set(WQA_METRICS.map(m => m.key));
  const missing: string[] = [];

  WQA_COLUMN_PRESETS.forEach(preset => {
    preset.columns.forEach(col => {
      if (!catalogKeys.has(col)) {
        missing.push(`${preset.id}: ${col}`);
      }
    });
  });

  return {
    valid: missing.length === 0,
    missing
  };
}
