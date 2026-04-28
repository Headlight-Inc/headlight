import { computeFacets } from '../services/SidebarFacets';

self.onmessage = (e) => {
    const { pages, mode, sections, selections } = e.data;
    
    try {
        const counts = computeFacets({ pages, mode, lsSections: sections, selections });
        self.postMessage({ type: 'FACETS_RESULT', counts });
    } catch (err) {
        console.error('[SidebarFacetsWorker] Error:', err);
        // Fallback to empty counts if error
        self.postMessage({ type: 'FACETS_RESULT', counts: {} });
    }
};
