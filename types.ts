export interface Metric {
	label: string;
	value: string | number;
	change: number; // percentage
	trend: "up" | "down" | "flat";
	isPositive: boolean;
}

export interface KeywordData {
	keyword: string;
	volume: number;
	position: number;
	change: number;
	intent: "Informational" | "Commercial" | "Transactional";
	cpc: number;
}

export interface ChartDataPoint {
	name: string;
	value: number;
	value2?: number; // For comparison
	value3?: number;
}

export enum UserMode {
	VISITOR = "VISITOR",
	SAAS_USER = "SAAS_USER",
	AGENCY_CLIENT = "AGENCY_CLIENT",
}

// Strategic Groups:
// 1. Intelligence (Strategy & Research)
// 2. Performance (Tracking & Health)
// 3. Operations (Execution & Automation)
export type ViewType =
	| "dashboard"
	// Intelligence
	| "content_predictor"
	| "keyword_research"
	| "competitors"
	// Performance
	| "rank_tracker"
	| "mentions"
	| "site_audit"
	| "web_vitals"
	// Operations
	| "agency_hub"
	| "automation"
	| "opportunities"
	// Settings
	| "settings_project"
	| "settings_account";

export type PanelType =
	| "competitor_add"
	| "keyword_detail"
	| "insight"
	| "context_help"
	| "audit_issue_detail"
	| "url_detail"
	| null;
