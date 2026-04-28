import { useEffect, useMemo, useState } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { computeFacets, type FacetCounts } from '../../../../services/SidebarFacets';

export function useFacetCounts(): FacetCounts {
	const { filteredPages, pageFilter, rootHostname } = useSeoCrawler();
	const [counts, setCounts] = useState<FacetCounts>({});

	const signature = useMemo(
		() => `${pageFilter.mode}:${filteredPages.length}:${JSON.stringify(pageFilter.selections)}`,
		[pageFilter.mode, filteredPages.length, pageFilter.selections]
	);

	useEffect(() => {
		let cancelled = false;
		const run = () => {
			if (filteredPages.length > 10_000 && typeof Worker !== 'undefined') {
				const worker = new Worker(new URL('../../../../workers/sidebar-facets.worker.ts', import.meta.url), { type: 'module' });
				worker.postMessage({ mode: pageFilter.mode, pages: filteredPages, rootHostname });
				worker.onmessage = e => { if (!cancelled) setCounts(e.data); worker.terminate(); };
			} else {
				const c = computeFacets({ mode: pageFilter.mode, pages: filteredPages, rootHostname });
				if (!cancelled) setCounts(c);
			}
		};
		run();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [signature]);

	return counts;
}
