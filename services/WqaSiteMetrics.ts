// services/WqaSiteMetrics.ts
import type { DetectedIndustry } from "./SiteTypeDetector";

export interface WqaSiteMetrics {
	// Universal
	totalPages: number;
	htmlPages: number;
	indexedPages: number;
	sitemapPages: number;
	sitemapCoverage: number;
	brokenRate: number;
	duplicateRate: number;
	orphanRate: number;
	thinContentRate: number;
	schemaCoverage: number;
	wwwInconsistency: boolean;
	avgHealthScore: number;
	avgContentQuality: number;
	avgSpeedScore: number;
	avgEeat: number;

	// Industry-aware (only populated when relevant)
	industry: DetectedIndustry;
	articleSchemaCoverage?: number;
	newsSitemapCoverage?: number;
	hasRssFeed?: boolean;
	productSchemaCoverage?: number;
	reviewSchemaCoverage?: number;
	breadcrumbCoverage?: number;
	outOfStockIndexed?: number;
	napConsistent?: boolean;
	hasLocalSchema?: boolean;
	hasGmbLink?: boolean;
	serviceAreaPageCount?: number;
	hasPricingPage?: boolean;
	hasDocsSection?: boolean;
	hasChangelog?: boolean;
	hasStatusPage?: boolean;
	medicalAuthorRate?: number;
	medicalDisclaimerRate?: number;
	financialDisclaimerRate?: number;
	hasMenuSchema?: boolean;
	hasReservationLink?: boolean;
	listingCount?: number;
}

const pct = (num: number, den: number) => (den === 0 ? 0 : (num / den) * 100);

export function computeWqaSiteMetrics(
	pages: any[],
	industry: DetectedIndustry,
): WqaSiteMetrics {
	const html = pages.filter((p) => p.isHtmlPage && p.statusCode === 200);
	const htmlCount = html.length || 1;

	const base: WqaSiteMetrics = {
		industry,
		totalPages: pages.length,
		htmlPages: html.length,
		indexedPages: html.filter((p) => p.indexable !== false).length,
		sitemapPages: html.filter((p) => p.inSitemap).length,
		sitemapCoverage: pct(html.filter((p) => p.inSitemap).length, htmlCount),
		brokenRate: pct(
			pages.filter((p) => p.statusCode >= 400).length,
			pages.length || 1,
		),
		duplicateRate: pct(
			html.filter((p) => p.isDuplicate || p.exactDuplicate).length,
			htmlCount,
		),
		orphanRate: pct(
			html.filter((p) => (p.inlinks || 0) === 0).length,
			htmlCount,
		),
		thinContentRate: pct(
			html.filter((p) => Number(p.wordCount || 0) < 150).length,
			htmlCount,
		),
		schemaCoverage: pct(
			html.filter((p) => (p.schemaTypes || []).length > 0).length,
			htmlCount,
		),
		wwwInconsistency: (() => {
			let w = 0,
				nw = 0;
			for (const p of pages) {
				try {
					new URL(p.url).hostname.startsWith("www.") ? w++ : nw++;
				} catch {}
			}
			return w > 0 && nw > 0;
		})(),
		avgHealthScore: avg(html.map((p) => Number(p.healthScore || 0))),
		avgContentQuality: avg(html.map((p) => Number(p.contentQualityScore || 0))),
		avgSpeedScore: avg(
			html.map((p) =>
				p.speedScore === "Good" ? 100 : p.speedScore === "Average" ? 60 : 30,
			),
		),
		avgEeat: avg(
			html.map((p) => Number(p.eeatScore || 0)).filter((v) => v > 0),
		),
	};

	switch (industry) {
		case "news":
		case "blog": {
			const posts = html.filter((p) => p.pageCategory === "blog_post");
			const count = posts.length || 1;
			base.articleSchemaCoverage = pct(
				posts.filter(
					(p) =>
						p.hasArticleSchema ||
						(p.schemaTypes || []).includes("Article") ||
						(p.schemaTypes || []).includes("NewsArticle"),
				).length,
				count,
			);
			base.newsSitemapCoverage = pct(
				posts.filter((p) => p.inNewsSitemap).length,
				count,
			);
			base.hasRssFeed = html.some((p) => p.industrySignals?.hasRssFeed);
			break;
		}
		case "ecommerce": {
			const products = html.filter((p) => p.pageCategory === "product");
			const count = products.length || 1;
			base.productSchemaCoverage = pct(
				products.filter((p) => (p.schemaTypes || []).includes("Product"))
					.length,
				count,
			);
			base.reviewSchemaCoverage = pct(
				products.filter((p) => (p.schemaTypes || []).includes("Review")).length,
				count,
			);
			base.breadcrumbCoverage = pct(
				products.filter((p) => (p.schemaTypes || []).includes("BreadcrumbList"))
					.length,
				count,
			);
			base.outOfStockIndexed = products.filter(
				(p) => p.industrySignals?.outOfStock && p.indexable !== false,
			).length;
			break;
		}
		case "local":
		case "restaurant": {
			base.hasLocalSchema = html.some(
				(p) => p.industrySignals?.hasLocalBusinessSchema,
			);
			base.hasGmbLink = html.some((p) => p.industrySignals?.hasGmbLink);
			base.serviceAreaPageCount = html.filter(
				(p) => p.pageCategory === "location_page",
			).length;
			const locationPages = html.filter(
				(p) => p.pageCategory === "location_page",
			);
			base.napConsistent =
				locationPages.length === 0 ||
				locationPages.every((p) => p.napMatchWithHomepage !== false);
			if (industry === "restaurant") {
				base.hasMenuSchema = html.some((p) =>
					(p.schemaTypes || []).includes("Menu"),
				);
				base.hasReservationLink = html.some(
					(p) => p.industrySignals?.hasReservationLink,
				);
			}
			break;
		}
		case "saas": {
			base.hasPricingPage = html.some((p) => p.hasPricingPage);
			base.hasDocsSection = html.some((p) => /\/docs(?:\/|$)/i.test(p.url));
			base.hasChangelog = html.some((p) => /\/changelog(?:\/|$)/i.test(p.url));
			base.hasStatusPage = html.some((p) => /\/status(?:\/|$)/i.test(p.url));
			break;
		}
		case "healthcare": {
			const med = html.filter(
				(p) =>
					p.pageCategory === "blog_post" || p.pageCategory === "service_page",
			);
			const count = med.length || 1;
			base.medicalAuthorRate = pct(
				med.filter((p) => p.industrySignals?.hasMedicalAuthor).length,
				count,
			);
			base.medicalDisclaimerRate = pct(
				med.filter((p) => p.industrySignals?.hasMedicalDisclaimer).length,
				count,
			);
			break;
		}
		case "finance": {
			const fin = html.filter(
				(p) =>
					p.pageCategory === "blog_post" || p.pageCategory === "service_page",
			);
			const count = fin.length || 1;
			base.financialDisclaimerRate = pct(
				fin.filter((p) => p.industrySignals?.hasFinancialDisclaimer).length,
				count,
			);
			break;
		}
		case "real_estate": {
			base.listingCount = html.filter((p) =>
				(p.schemaTypes || []).some((t: string) =>
					["RealEstateListing", "Residence", "Apartment"].includes(t),
				),
			).length;
			break;
		}
	}

	return base;
}

function avg(values: number[]): number {
	const filtered = values.filter((v) => Number.isFinite(v));
	if (filtered.length === 0) return 0;
	return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}
