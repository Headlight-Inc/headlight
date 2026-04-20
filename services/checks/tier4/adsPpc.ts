import { CheckResult, CheckEvaluator } from "../types";

export const checkAdScripts: CheckEvaluator = (page) => {
	if (page.crawlDepth !== 0) return null;
	const platforms = page.adPlatforms || {};
	const active = Object.entries(platforms)
		.filter(([_, value]) => value === true)
		.map(([key]) => key);

	return {
		checkId: "t4-ad-scripts",
		tier: 4,
		category: "ads_ppc",
		name: "Ad Platform Detection",
		severity: active.length > 0 ? "pass" : "info",
		value: active,
		expected: "Ad/analytics platforms detected",
		message:
			active.length > 0
				? `Detected: ${active.join(", ")}`
				: "No major ad platforms detected.",
		auditModes: ["full"],
		industries: ["all"],
	};
};

export const checkConversionTracking: CheckEvaluator = (page) => {
	if (page.crawlDepth !== 0) return null;
	const platforms = page.adPlatforms || {};
	const hasTracking =
		platforms.gtm || platforms.metaPixel || platforms.googleAds;

	return {
		checkId: "t4-conversion-tracking",
		tier: 4,
		category: "ads_ppc",
		name: "Conversion Tracking",
		severity: hasTracking ? "pass" : "info",
		value: { tracking: hasTracking },
		expected: "Conversion tracking (GTM, Meta Pixel, etc.) present",
		message: hasTracking
			? "Conversion tracking detected."
			: "No conversion tracking scripts found.",
		auditModes: ["full", "ecommerce"],
		industries: ["all"],
	};
};

export const checkRemarketing: CheckEvaluator = (page) => {
	if (page.crawlDepth !== 0) return null;
	const platforms = page.adPlatforms || {};
	const hasRemarketing = platforms.metaPixel || platforms.googleAds;

	return {
		checkId: "t4-remarketing",
		tier: 4,
		category: "ads_ppc",
		name: "Remarketing Tags",
		severity: hasRemarketing ? "pass" : "info",
		value: { remarketing: hasRemarketing },
		expected: "Remarketing tags (FB, Google) present",
		message: hasRemarketing
			? "Remarketing tags detected."
			: "No remarketing tags found.",
		auditModes: ["full"],
		industries: ["all"],
	};
};

export const adsPpcChecks: Record<string, CheckEvaluator> = {
	"t4-ad-scripts": checkAdScripts,
	"t4-conversion-tracking": checkConversionTracking,
	"t4-remarketing": checkRemarketing,
};
