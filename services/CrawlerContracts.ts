export type CrawlExecutionMode = "local" | "managed" | "byo-agent";
export type CrawlPolicy =
	| "general"
	| "local-business"
	| "ecommerce"
	| "content-site"
	| "multi-location"
	| "franchise";
export type CrawlRetentionPolicy = "lean" | "full" | "ephemeral";
export type CrawlEvidenceSource =
	| "crawl"
	| "gsc"
	| "ga4"
	| "bing"
	| "ahrefs"
	| "semrush"
	| "user-import";

export interface CrawlJobContract {
	id: string;
	projectId: string;
	sessionId: string;
	executionMode: CrawlExecutionMode;
	policy: CrawlPolicy;
	retentionPolicy: CrawlRetentionPolicy;
	entryUrls: string[];
	limits: {
		maxPages?: number;
		maxDepth?: number;
		concurrency?: number;
	};
	createdAt: string;
}

export interface CrawlRunContract {
	id: string;
	projectId: string;
	sessionId: string;
	jobId: string;
	status: "running" | "paused" | "completed" | "failed";
	crawlMode: "spider" | "list" | "sitemap";
	executionMode: CrawlExecutionMode;
	policy: CrawlPolicy;
	retentionPolicy: CrawlRetentionPolicy;
	urlCrawled: string;
	createdAt: string;
	completedAt?: string | null;
}

export interface CrawlPageInsightContract {
	id: string;
	runId: string;
	projectId: string;
	url: string;
	isChanged: boolean;
	isTopPage: boolean;
	hasSevereIssues: boolean;
	evidenceSources: CrawlEvidenceSource[];
}

export interface CrawlIssueClusterContract {
	id: string;
	runId: string;
	category: string;
	title: string;
	priority: "Critical" | "High" | "Medium" | "Low";
	issueType: "error" | "warning" | "notice" | "passed";
	affectedCount: number;
	evidenceSources: CrawlEvidenceSource[];
}

export interface TrendSnapshotContract {
	id: string;
	runId: string;
	projectId: string;
	snapshotAt: string;
	metrics: Record<string, number>;
}

export const CRAWLER_SCHEMA_VERSION = "2026-03-29";

export const resolveExecutionMode = (config: any): CrawlExecutionMode => {
	if (
		config?.executionMode === "managed" ||
		config?.executionMode === "byo-agent"
	) {
		return config.executionMode;
	}
	if (config?.useGhostEngine) return "local";
	return "managed";
};

export const resolveCrawlPolicy = (projectType?: string): CrawlPolicy => {
	switch (String(projectType || "").toLowerCase()) {
		case "local-business":
			return "local-business";
		case "ecommerce":
			return "ecommerce";
		case "content-site":
			return "content-site";
		case "multi-location":
			return "multi-location";
		case "franchise":
			return "franchise";
		default:
			return "general";
	}
};

export const resolveRetentionPolicy = (config: any): CrawlRetentionPolicy => {
	if (
		config?.retentionPolicy === "full" ||
		config?.retentionPolicy === "ephemeral"
	) {
		return config.retentionPolicy;
	}
	return "lean";
};
