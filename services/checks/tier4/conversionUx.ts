import { CheckResult, CheckEvaluator } from "../types";

export const checkSocialProof: CheckEvaluator = (page) => {
	const signals = [
		page.hasTestimonials,
		page.hasCaseStudies,
		page.hasCustomerLogos,
	];
	const count = signals.filter(Boolean).length;
	const severity = count >= 2 ? "pass" : count === 1 ? "info" : "info";

	return {
		checkId: "t4-social-proof",
		tier: 4,
		category: "conversion_ux",
		name: "Social Proof Signals",
		severity,
		value: {
			testimonials: page.hasTestimonials,
			caseStudies: page.hasCaseStudies,
			logos: page.hasCustomerLogos,
		},
		expected: "Multiple social proof signals",
		message:
			count > 0
				? `${count} social proof signals detected.`
				: "No testimonials, case studies, or customer logos found.",
		auditModes: ["full", "website_quality"],
		industries: ["all"],
	};
};

export const checkFormQuality: CheckEvaluator = (page) => {
	// If the page has forms (detected via crawlerWorker), check if autocomplete is enabled.
	// page.hasForms is a hypothetical field we'll add to crawlerWorker if not there.
	// For now we check if any form-related data exists.
	const hasForms =
		page.hasFormsWithAutocomplete !== undefined ||
		(page.formsWithoutLabels || 0) > 0;
	if (!hasForms) return null;

	const hasAutocomplete = page.hasFormsWithAutocomplete;
	const labelsMissing = (page.formsWithoutLabels || 0) > 0;
	const severity = labelsMissing
		? "warning"
		: hasAutocomplete
			? "pass"
			: "info";

	return {
		checkId: "t4-form-quality",
		tier: 4,
		category: "conversion_ux",
		name: "Form Quality",
		severity,
		value: { hasAutocomplete, labelsMissing },
		expected: "Accessible forms with autocomplete enabled",
		message: labelsMissing
			? "Forms detected without associated labels."
			: !hasAutocomplete
				? "Forms found but missing autocomplete attributes."
				: "Form quality is good.",
		auditModes: ["full", "website_quality", "ecommerce"],
		industries: ["all"],
	};
};

export const checkExitIntent: CheckEvaluator = (page) => {
	// TODO: Add exit intent detection to crawlerWorker.js
	// For now return an info result indicating this requires additional extraction.
	return {
		checkId: "t4-exit-intent",
		tier: 4,
		category: "conversion_ux",
		name: "Exit Intent Detection",
		severity: "info",
		value: "Requires additional extraction",
		expected: "Exit intent popup detection",
		message:
			"Exit intent detection requires additional DOM analysis in crawlerWorker.",
		auditModes: ["full"],
		industries: ["all"],
	};
};

export const conversionUxChecks: Record<string, CheckEvaluator> = {
	"t4-social-proof": checkSocialProof,
	"t4-form-quality": checkFormQuality,
	"t4-exit-intent": checkExitIntent,
};
