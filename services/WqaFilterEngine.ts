/**
 * WqaFilterEngine.ts
 *
 * Pure logic for filtering pages and computing facet counts in WQA mode.
 */
export interface WqaFilterState {
  pageCategory: string | 'all';
  actionType: string | 'all';
  priorityLevel: number | 0; // 0=all, 1=high, 2=med, 3=low
  searchTerm: string;
}

export interface WqaFacets {
  categories: Record<string, number>;
  actions: Record<string, number>;
  priorities: Record<string, number>;
}

export function filterWqaPages(pages: any[], filter: WqaFilterState): any[] {
  return pages.filter((p) => {
    if (filter.pageCategory !== 'all' && p.pageCategory !== filter.pageCategory) return false;
    if (filter.actionType !== 'all' && p.primaryAction !== filter.actionType) return false;
    
    if (filter.priorityLevel > 0) {
      const pLevel = 
        p.actionPriority <= 3 ? 1 : 
        p.actionPriority <= 7 ? 2 : 3;
      if (pLevel !== filter.priorityLevel) return false;
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      const match = (p.url + ' ' + (p.title || '') + ' ' + (p.primaryAction || '')).toLowerCase().includes(term);
      if (!match) return false;
    }

    return true;
  });
}

export function computeWqaFacets(pages: any[]): WqaFacets {
  const facets: WqaFacets = {
    categories: {},
    actions: {},
    priorities: { '1': 0, '2': 0, '3': 0 },
  };

  for (const p of pages) {
    const cat = p.pageCategory || 'other';
    facets.categories[cat] = (facets.categories[cat] || 0) + 1;

    const action = p.primaryAction || 'Monitor';
    facets.actions[action] = (facets.actions[action] || 0) + 1;

    const level = 
      p.actionPriority <= 3 ? '1' : 
      p.actionPriority <= 7 ? '2' : '3';
    facets.priorities[level]++;
  }

  return facets;
}
