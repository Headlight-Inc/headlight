// services/ActionAssignment.ts  (replace body, keep exports)
import { deriveActionFactors } from "./ActionFactors";
import {
	pickTechnicalAction,
	pickContentAction,
	pickIndustryActions,
	type AssignedAction,
} from "./ActionCatalog";
import type { DetectedIndustry } from "./SiteTypeDetector";
import type { DataAvailability } from "./DataAvailability";

export type { AssignedAction };

interface SiteContextForAction {
	detectedIndustry: DetectedIndustry;
	detectedLanguage: string;
	totalPages: number;
	isMultiLanguage: boolean;
	availability: DataAvailability;
}

const NULL_TECH: AssignedAction = {
	id: "monitor",
	action: "Monitor",
	reason: "No technical issues found.",
	priority: 99,
	estimatedImpact: 0,
	effort: "low",
	category: "technical",
};
const NULL_CONTENT: AssignedAction = {
	id: "no_action",
	action: "No Action",
	reason: "Content metrics are healthy.",
	priority: 99,
	estimatedImpact: 0,
	effort: "low",
	category: "content",
};

export function assignTechnicalAction(
	page: any,
	ctx: SiteContextForAction,
): AssignedAction {
	const f = deriveActionFactors(page, {
		industry: ctx.detectedIndustry,
		availability: ctx.availability,
	});
	if (!f.isHtmlPage) return { ...NULL_TECH, reason: "Non-HTML resource." };
	return pickTechnicalAction(f) ?? NULL_TECH;
}

export function assignContentAction(
	page: any,
	ctx: SiteContextForAction,
): AssignedAction {
	const f = deriveActionFactors(page, {
		industry: ctx.detectedIndustry,
		availability: ctx.availability,
	});
	if (!f.isHtmlPage || f.statusCode >= 400)
		return { ...NULL_CONTENT, reason: "Non-content page." };
	return pickContentAction(f) ?? NULL_CONTENT;
}

export function getIndustryActions(
	page: any,
	ctx: SiteContextForAction,
): AssignedAction[] {
	const f = deriveActionFactors(page, {
		industry: ctx.detectedIndustry,
		availability: ctx.availability,
	});
	return pickIndustryActions(f);
}
