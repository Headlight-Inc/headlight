import { CheckResult, CheckEvaluator } from "../types";

export const checkEcomProductSchema: CheckEvaluator = (page, ctx) => {
	if (ctx?.industry !== "ecommerce") return null;
	const hasProduct = (page.schemaTypes || []).includes("Product");
	const isLikelyProductPage = /(product|item|shop|p\/\d+)/i.test(page.url);
	if (!isLikelyProductPage && !hasProduct) return null;

	return {
		checkId: "t4-ecom-product-schema",
		tier: 4,
		category: "ecommerce",
		name: "Product Schema",
		severity: hasProduct ? "pass" : "info",
		value: { hasProduct },
		expected: "Product schema markup on product pages",
		message: hasProduct
			? "Product schema detected."
			: "No Product schema found on this page.",
		auditModes: ["full", "ecommerce"],
		industries: ["ecommerce"],
	};
};

export const checkEcomReviewSchema: CheckEvaluator = (page, ctx) => {
	if (ctx?.industry !== "ecommerce") return null;
	const hasReview = (page.schemaTypes || []).some((t: string) =>
		["Review", "AggregateRating"].includes(t),
	);
	const isLikelyProductPage = /(product|item|shop|p\/\d+)/i.test(page.url);
	if (!isLikelyProductPage && !hasReview) return null;

	return {
		checkId: "t4-ecom-review-schema",
		tier: 4,
		category: "ecommerce",
		name: "Review Schema",
		severity: hasReview ? "pass" : "info",
		value: { hasReview },
		expected: "Review or AggregateRating schema on product pages",
		message: hasReview
			? "Review/Rating schema detected."
			: "No Review schema found. Important for rich snippets.",
		auditModes: ["full", "ecommerce"],
		industries: ["ecommerce"],
	};
};

export const checkEcomPrice: CheckEvaluator = (page, ctx) => {
	if (ctx?.industry !== "ecommerce") return null;
	const schemaStr = JSON.stringify(page.schema || []);
	const hasPrice =
		schemaStr.includes('"price"') || schemaStr.includes('"Offer"');
	if (!hasPrice && !/(product|item|shop)/i.test(page.url)) return null;

	return {
		checkId: "t4-ecom-price",
		tier: 4,
		category: "ecommerce",
		name: "Price Markup",
		severity: hasPrice ? "pass" : "info",
		value: { hasPrice },
		expected: "Price markup within Offer schema",
		message: hasPrice
			? "Price information found in schema."
			: "No price markup detected in structured data.",
		auditModes: ["full", "ecommerce"],
		industries: ["ecommerce"],
	};
};

export const checkEcomBreadcrumbs: CheckEvaluator = (page, ctx) => {
	if (ctx?.industry !== "ecommerce") return null;
	const hasBreadcrumbs = (page.schemaTypes || []).includes("BreadcrumbList");
	if (page.crawlDepth < 2) return null;

	return {
		checkId: "t4-ecom-breadcrumbs",
		tier: 4,
		category: "ecommerce",
		name: "Breadcrumb Navigation",
		severity: hasBreadcrumbs ? "pass" : "info",
		value: { hasBreadcrumbs },
		expected: "BreadcrumbList schema for category/product pages",
		message: hasBreadcrumbs
			? "Breadcrumb schema detected."
			: "No BreadcrumbList schema found.",
		auditModes: ["full", "ecommerce"],
		industries: ["ecommerce"],
	};
};

export const ecommerceChecks: Record<string, CheckEvaluator> = {
	"t4-ecom-product-schema": checkEcomProductSchema,
	"t4-ecom-review-schema": checkEcomReviewSchema,
	"t4-ecom-price": checkEcomPrice,
	"t4-ecom-breadcrumbs": checkEcomBreadcrumbs,
};
