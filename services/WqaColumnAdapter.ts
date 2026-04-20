// services/WqaColumnAdapter.ts
import type { DetectedIndustry } from "./SiteTypeDetector";
import type { DataAvailability } from "./DataAvailability";
import { getHiddenColumnsForLanguage } from "./LanguageAdaptation";
import {
	WQA_METRICS,
	isMetricVisible,
	type CatalogContext,
} from "./WqaMetricCatalog";

export interface WqaColumnContext {
	industry: DetectedIndustry;
	language: string;
	cms: string | null;
	availability: DataAvailability;
	lowIndustryConfidence?: boolean;
}

export function getWqaColumns(ctx: WqaColumnContext): string[] {
	const catalogCtx: CatalogContext = {
		industry: ctx.industry,
		language: ctx.language,
		cms: ctx.cms,
		availability: ctx.availability,
		lowIndustryConfidence: Boolean(ctx.lowIndustryConfidence),
	};
	const langHidden = new Set(getHiddenColumnsForLanguage(ctx.language));
	return WQA_METRICS.filter((m) => m.surfaces.includes("grid"))
		.filter((m) => isMetricVisible(m, catalogCtx))
		.map((m) => m.key)
		.filter((key) => !langHidden.has(key));
}

export function getWqaDefaultVisibleColumns(ctx: WqaColumnContext): string[] {
	const all = new Set(getWqaColumns(ctx));
	return WQA_METRICS.filter(
		(m) => m.surfaces.includes("grid") && m.isDefault && all.has(m.key),
	).map((m) => m.key);
}

// ─── Legacy-compat shims (so AuditModeConfig's current signature keeps working) ───
export function getWqaColumnsLegacy(
	industry: DetectedIndustry,
	language = "en",
	cms: string | null = null,
): string[] {
	return getWqaColumns({
		industry,
		language,
		cms,
		availability: { gsc: true, ga4: true, backlinks: true } as any,
		lowIndustryConfidence: false,
	});
}
export function getWqaDefaultVisibleColumnsLegacy(
	industry: DetectedIndustry,
	language = "en",
	cms: string | null = null,
): string[] {
	return getWqaDefaultVisibleColumns({
		industry,
		language,
		cms,
		availability: { gsc: true, ga4: true, backlinks: true } as any,
		lowIndustryConfidence: false,
	});
}
