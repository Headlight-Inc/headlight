const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PSIResult {
	url: string;
	fieldLCP: number | null; // Real-user LCP (ms)
	fieldCLS: number | null; // Real-user CLS
	fieldINP: number | null; // Real-user INP (ms)
	fieldFCP: number | null; // Real-user FCP (ms)
	fieldTTFB: number | null; // Real-user TTFB (ms)
	performanceScore: number; // Lighthouse perf score 0-100
	accessibilityScore: number;
	bestPracticesScore: number;
	seoScore: number;
	lcpElement: string | null;
	speedIndex: number | null;
	tbt: number | null; // Total Blocking Time
}

export async function fetchPageSpeedInsights(
	url: string,
	apiKey?: string,
	strategy: "mobile" | "desktop" = "mobile",
): Promise<PSIResult> {
	const params = new URLSearchParams({
		url,
		strategy,
		category: "performance",
		...(apiKey ? { key: apiKey } : {}),
	});

	// We can request multiple categories
	params.append("category", "accessibility");
	params.append("category", "best-practices");
	params.append("category", "seo");

	const resp = await fetch(`${PSI_API}?${params}`);
	if (!resp.ok) {
		const errorBody = await resp.text();
		throw new Error(`PSI API error: ${resp.status} - ${errorBody}`);
	}

	const data = await resp.json();
	const lighthouse = data.lighthouseResult;
	const cruxMetrics = data.loadingExperience?.metrics || {};

	return {
		url,
		fieldLCP: cruxMetrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile || null,
		fieldCLS: cruxMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
			? cruxMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
			: null,
		fieldINP: cruxMetrics.INTERACTION_TO_NEXT_PAINT?.percentile || null,
		fieldFCP: cruxMetrics.FIRST_CONTENTFUL_PAINT_MS?.percentile || null,
		fieldTTFB: cruxMetrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile || null,
		performanceScore: Math.round(
			(lighthouse?.categories?.performance?.score || 0) * 100,
		),
		accessibilityScore: Math.round(
			(lighthouse?.categories?.accessibility?.score || 0) * 100,
		),
		bestPracticesScore: Math.round(
			(lighthouse?.categories?.["best-practices"]?.score || 0) * 100,
		),
		seoScore: Math.round((lighthouse?.categories?.seo?.score || 0) * 100),
		lcpElement:
			lighthouse?.audits?.["largest-contentful-paint-element"]?.details
				?.items?.[0]?.node?.snippet || null,
		speedIndex: lighthouse?.audits?.["speed-index"]?.numericValue || null,
		tbt: lighthouse?.audits?.["total-blocking-time"]?.numericValue || null,
	};
}
