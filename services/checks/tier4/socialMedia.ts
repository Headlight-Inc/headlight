import { CheckResult, CheckEvaluator } from "../types";

export const checkSocialProfiles: CheckEvaluator = (page) => {
	if (page.crawlDepth !== 0) return null;
	const links = page.socialLinks || {};
	const count = Object.values(links).filter(Boolean).length;
	const severity = count >= 3 ? "pass" : count >= 1 ? "info" : "info";

	return {
		checkId: "t4-social-profiles",
		tier: 4,
		category: "social_media",
		name: "Social Profile Detection",
		severity,
		value: links,
		expected: "At least 3 social profiles linked",
		message:
			count > 0
				? `${count} social profiles detected.`
				: "No social media profiles found on homepage.",
		auditModes: ["full", "off_page"],
		industries: ["all"],
	};
};

export const checkSocialSchema: CheckEvaluator = (page) => {
	if (!page.schema || !Array.isArray(page.schema)) return null;
	const sameAsLinks = page.schema.flatMap((s: any) => s.sameAs || []);
	const hasSocialSchema = sameAsLinks.some((url: string) =>
		/(facebook|twitter|instagram|linkedin|youtube|tiktok)\.com/i.test(url),
	);

	return {
		checkId: "t4-social-schema",
		tier: 4,
		category: "social_media",
		name: "Social Schema Markup",
		severity: hasSocialSchema ? "pass" : "info",
		value: sameAsLinks,
		expected: "Social profiles mentioned in JSON-LD sameAs",
		message: hasSocialSchema
			? "Social profiles found in schema markup."
			: "No social profiles found in schema sameAs properties.",
		auditModes: ["full", "off_page"],
		industries: ["all"],
	};
};

export const socialMediaChecks: Record<string, CheckEvaluator> = {
	"t4-social-profiles": checkSocialProfiles,
	"t4-social-schema": checkSocialSchema,
};
