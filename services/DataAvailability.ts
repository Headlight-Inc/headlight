/**
 * DataAvailability.ts
 *
 * Tells the action engine what data sources are populated for a site,
 * so actions can pick the right heuristic (no silent degradation).
 */
export interface DataAvailability {
	gsc: boolean; // GSC connected & page has impressions field
	ga4: boolean; // GA4 connected & page has sessions field
	backlinks: boolean; // Ahrefs/SEMrush
	cwv: boolean; // Real CWV (field data, not synthetic)
}

export function detectDataAvailability(pages: any[]): DataAvailability {
	if (pages.length === 0)
		return { gsc: false, ga4: false, backlinks: false, cwv: false };

	const gsc = pages.some(
		(p) => p.gscImpressions !== undefined && p.gscImpressions !== null,
	);
	const ga4 = pages.some(
		(p) => p.ga4Sessions !== undefined && p.ga4Sessions !== null,
	);
	const backlinks = pages.some(
		(p) => Number(p.referringDomains || 0) > 0 || Number(p.backlinks || 0) > 0,
	);
	const cwv = pages.some((p) => p.fieldLcp || p.fieldCls || p.fieldInp);

	return { gsc, ga4, backlinks, cwv };
}
