// services/WqaQuickFilters.ts

/**
 * Quick filter predicates rewritten to read from the namespaced metric catalog keys.
 * These are used by the UI to filter the grid in WQA mode.
 */
export const WQA_QUICK_FILTERS = [
	{ 
        id: 'quick_wins',                
        label: 'Quick wins',                  
        metricKeys: ['p.search.gsc.position', 'p.search.gsc.impressions'], 
        predicate: (m: any) => m['p.search.gsc.position'] >= 4 && m['p.search.gsc.position'] <= 10 && m['p.search.gsc.impressions'] >= 100 
    },
	{ 
        id: 'losing_traffic',            
        label: 'Losing traffic',              
        metricKeys: ['p.search.clicksDeltaPct'], 
        predicate: (m: any) => m['p.search.clicksDeltaPct'] < -20 
    },
	{ 
        id: 'striking_distance',         
        label: 'Striking distance',           
        metricKeys: ['p.search.gsc.position'], 
        predicate: (m: any) => m['p.search.gsc.position'] > 10 && m['p.search.gsc.position'] <= 20 
    },
	{ 
        id: 'no_search_traffic',         
        label: 'No search traffic',           
        metricKeys: ['p.search.gsc.clicks'], 
        predicate: (m: any) => (m['p.search.gsc.clicks'] ?? 0) === 0 
    },
	{ 
        id: 'thin_content',              
        label: 'Thin content',                
        metricKeys: ['p.content.thinFlag'], 
        predicate: (m: any) => m['p.content.thinFlag'] === true 
    },
	{ 
        id: 'broken_or_redirect',        
        label: 'Broken or redirect',          
        metricKeys: ['p.tech.statusCode'], 
        predicate: (m: any) => m['p.tech.statusCode'] >= 300 
    },
	{ 
        id: 'orphans',                   
        label: 'Orphans',                     
        metricKeys: ['p.links.inlinks'], 
        predicate: (m: any) => (m['p.links.inlinks'] ?? 0) === 0 
    },
	{ 
        id: 'stale',                     
        label: 'Stale',                       
        metricKeys: ['p.content.age'], 
        predicate: (m: any) => m['p.content.age'] === 'stale' 
    },
	{ 
        id: 'high_value_low_engagement', 
        label: 'High value, low engagement',  
        metricKeys: ['p.score.valueTier', 'p.ga.engagementTime'], 
        predicate: (m: any) => ['***','**'].includes(m['p.score.valueTier']) && (m['p.ga.engagementTime'] ?? 0) < 30 
    },
] as const;

import { DEFAULT_WQA_FILTER, type WqaFilterState } from './WqaFilterEngine';

export function applyQuickFilterPatch(
	current: WqaFilterState,
	patch: Partial<WqaFilterState>,
): WqaFilterState {
	return { ...DEFAULT_WQA_FILTER, searchTerm: current.searchTerm, ...patch };
}
