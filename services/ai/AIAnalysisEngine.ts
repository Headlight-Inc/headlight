import { AIRouter } from "./AIRouter";
import * as prompts from "./tasks/prompts";

export interface PageAIResult {
	url: string;
	// t3-content-summary
	summary?: string;
	// t3-content-quality
	contentQualityScore?: number;
	contentStrengths?: string[];
	contentWeaknesses?: string[];
	// t3-content-intent
	searchIntent?: string;
	intentConfidence?: number;
	// t3-content-eeat
	eeatScore?: number;
	eeatBreakdown?: Record<string, number>;
	eeatSuggestions?: string[];
	// t3-keyword-extract
	extractedKeywords?: Array<{
		phrase: string;
		intent: string;
		relevance: number;
	}>;
	// t3-entity-extraction
	entities?: Array<{ name: string; type: string; count: number }>;
	// t3-topic-cluster
	topicCluster?: string;
	primaryTopic?: string;
	// t3-fix-suggestion
	fixSuggestions?: Array<{
		fix: string;
		impact: string;
		effort: string;
		code?: string;
	}>;
	// t3-content-sentiment
	sentiment?: string;
	sentimentConfidence?: number;
	sentimentTone?: string;
	// t3-ai-generated
	aiLikelihood?: "low" | "medium" | "high";
	aiConfidence?: number;
	// t3-content-gaps
	gaps?: Array<{ topic: string; reason: string; priority: string }>;
	// t3-content-originality
	originalityScore?: number;
	embeddings?: number[];
	// Meta rewrite (if meta is missing/poor)
	suggestedMeta?: string;
	// GEO (Generative Engine Optimization)
	citationWorthiness?: number;
	extractionReady?: number;
	entityCoverage?: number;
	freshnessSignal?: number;
	aiOverviewFit?: number;
	overallGeoScore?: number;
	geoReasoning?: string;
	geoSuggestions?: string[];
	grammarAIErrors?: number;
	grammarAIDetails?: string[];
	grammarSource?: "ai" | "heuristic";
	// Errors during analysis
	errors?: string[];
}

export class AIAnalysisEngine {
	private router: AIRouter;

	constructor(router: AIRouter) {
		this.router = router;
	}

	// ─── Analyze a single page ────────────────────────
	async analyzePage(page: {
		url: string;
		title: string;
		metaDesc: string;
		h1_1: string;
		textContent: string;
		wordCount: number;
		grammarErrors?: number;
		previousData?: {
			gscClicks?: number;
			gscImpressions?: number;
			ga4Sessions?: number;
		};
		issues: Array<{ id: string; label: string; detail?: string }>;
		gscKeywords?: string[];
		competitorTopics?: string[];
	}): Promise<PageAIResult> {
		const result: PageAIResult = { url: page.url, errors: [] };

		// Define all tasks as individual promises
		const tasks: Promise<void>[] = [];

		// 0. GEO Scoring
		if (page.wordCount >= 200) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildGEOScoreRequest(
								page.url,
								page.title,
								page.textContent,
								(page as any).passageReadiness || 0,
								(page as any).voiceSearchScore || 0,
							),
						);
						const data = JSON.parse(resp.text);
						result.citationWorthiness = data.citationWorthiness;
						result.extractionReady = data.extractionReady;
						result.entityCoverage = data.entityCoverage;
						result.freshnessSignal = data.freshnessSignal;
						result.aiOverviewFit = data.aiOverviewFit;
						result.overallGeoScore = data.overallGeoScore;
						result.geoReasoning = data.reasoning;
						result.geoSuggestions = data.suggestions;
					} catch (e: any) {
						result.errors!.push(`geo: ${e.message}`);
					}
				})(),
			);
		}

		// 1. Summary
		tasks.push(
			(async () => {
				try {
					const resp = await this.router.complete(
						prompts.buildSummaryRequest(page.url, page.title, page.textContent),
					);
					result.summary = resp.text;
				} catch (e: any) {
					result.errors!.push(`summary: ${e.message}`);
				}
			})(),
		);

		// 2. Intent
		tasks.push(
			(async () => {
				try {
					const resp = await this.router.complete(
						prompts.buildIntentRequest(
							page.url,
							page.title,
							page.metaDesc,
							page.h1_1,
						),
					);
					const data = JSON.parse(resp.text);
					result.searchIntent = data.intent;
					result.intentConfidence = data.confidence;
				} catch (e: any) {
					result.errors!.push(`intent: ${e.message}`);
				}
			})(),
		);

		// 3. Quality
		if (page.wordCount >= 100) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildQualityScoreRequest(
								page.url,
								page.title,
								page.textContent,
								page.wordCount,
							),
						);
						const data = JSON.parse(resp.text);
						result.contentQualityScore = data.quality;
						result.contentStrengths = data.strengths;
						result.contentWeaknesses = data.weaknesses;
					} catch (e: any) {
						result.errors!.push(`quality: ${e.message}`);
					}
				})(),
			);
		}

		// 4. Keywords
		if (page.wordCount >= 50) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildKeywordExtractionRequest(
								page.url,
								page.title,
								page.textContent,
							),
						);
						const data = JSON.parse(resp.text);
						result.extractedKeywords = data.keywords;
					} catch (e: any) {
						result.errors!.push(`keywords: ${e.message}`);
					}
				})(),
			);
		}

		// 5. Cluster
		tasks.push(
			(async () => {
				try {
					const resp = await this.router.complete(
						prompts.buildTopicClusterRequest(
							page.url,
							page.title,
							page.textContent,
						),
					);
					const data = JSON.parse(resp.text);
					result.topicCluster = data.cluster;
					result.primaryTopic = data.primaryTopic;
				} catch (e: any) {
					result.errors!.push(`cluster: ${e.message}`);
				}
			})(),
		);

		// 6. EEAT
		if (page.wordCount >= 200) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildEEATRequest(
								page.url,
								page.textContent,
								false,
								false,
							),
						);
						const data = JSON.parse(resp.text);
						result.eeatScore = data.overall;
						result.eeatSuggestions = data.suggestions;
						result.eeatBreakdown = {
							experience: data.experience,
							expertise: data.expertise,
							authoritativeness: data.authoritativeness,
							trustworthiness: data.trustworthiness,
						};
					} catch (e: any) {
						result.errors!.push(`eeat: ${e.message}`);
					}
				})(),
			);
		}

		// 7. Sentiment
		tasks.push(
			(async () => {
				try {
					const resp = await this.router.complete(
						prompts.buildSentimentRequest(
							page.url,
							page.title,
							page.textContent,
						),
					);
					const data = JSON.parse(resp.text);
					result.sentiment = data.sentiment;
					result.sentimentConfidence = data.confidence;
					result.sentimentTone = data.tone;
				} catch (e: any) {
					result.errors!.push(`sentiment: ${e.message}`);
				}
			})(),
		);

		// 8. AI Detection
		if (page.wordCount >= 100) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildAIDetectionRequest(page.textContent),
						);
						const data = JSON.parse(resp.text);
						result.aiLikelihood = data.likelihood;
						result.aiConfidence = data.confidence;
					} catch (e: any) {
						result.errors!.push(`ai-detect: ${e.message}`);
					}
				})(),
			);
		}

		// 9. Content Gaps
		if (page.wordCount >= 100) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildContentGapRequest(
								page.url,
								page.title,
								page.textContent,
								page.gscKeywords || [],
								page.competitorTopics,
							),
						);
						const data = JSON.parse(resp.text);
						result.gaps = data.gaps;
					} catch (e: any) {
						result.errors!.push(`content-gaps: ${e.message}`);
					}
				})(),
			);
		}

		// 10. Entity Extraction
		if (page.wordCount >= 100) {
			tasks.push(
				(async () => {
					try {
						const resp = await this.router.complete(
							prompts.buildEntityRequest(page.textContent),
						);
						const data = JSON.parse(resp.text);
						result.entities = data.entities;
					} catch (e: any) {
						result.errors!.push(`entities: ${e.message}`);
					}
				})(),
			);
		}

		// 11. Embeddings
		tasks.push(
			(async () => {
				try {
					const resp = await this.router.complete({
						taskType: "embed",
						prompt: page.textContent.slice(0, 1000),
					});
					result.embeddings = JSON.parse(resp.text);
				} catch (e: any) {
					result.errors!.push(`embed: ${e.message}`);
				}
			})(),
		);

		// 11b. AI grammar verification for pages already flagged by heuristics
		if ((page.grammarErrors || 0) > 3) {
			tasks.push(
				(async () => {
					try {
						const grammar = await this.analyzeGrammar(page.textContent);
						result.grammarAIErrors = grammar.errors;
						result.grammarAIDetails = grammar.details;
						result.grammarSource = "ai";
					} catch {
						result.grammarSource = "heuristic";
					}
				})(),
			);
		} else {
			result.grammarSource = "heuristic";
		}

		// Wait for all non-dependent tasks to finish
		await Promise.all(tasks);

		// 12. Fix suggestions (sequential due to specific prompts)
		if (page.issues.length > 0) {
			const topIssues = page.issues.slice(0, 3);
			const fixes: PageAIResult["fixSuggestions"] = [];
			for (const issue of topIssues) {
				try {
					const resp = await this.router.complete(
						prompts.buildFixSuggestionRequest(
							page.url,
							issue.label,
							issue.detail || "",
							page.textContent.slice(0, 500),
						),
					);
					fixes.push(JSON.parse(resp.text));
				} catch {
					/* skip */
				}
			}
			result.fixSuggestions = fixes;
		}

		// 13. Meta rewrite
		if (!page.metaDesc) {
			try {
				const keywords = result.extractedKeywords?.map((k) => k.phrase) || [];
				const resp = await this.router.complete(
					prompts.buildMetaRewriteRequest(
						page.url,
						page.title,
						"",
						keywords,
						page.textContent,
					),
				);
				const data = JSON.parse(resp.text);
				result.suggestedMeta = data.metaDescription;
			} catch (e: any) {
				result.errors!.push(`meta: ${e.message}`);
			}
		}

		return result;
	}

	// ─── Batch analyze all pages ──────────────────────
	async analyzePages(
		pages: Array<Parameters<AIAnalysisEngine["analyzePage"]>[0]>,
		onProgress?: (done: number, total: number, currentUrl: string) => void,
	): Promise<PageAIResult[]> {
		const results: PageAIResult[] = [];

		// Process pages sequentially with small delay to respect rate limits
		for (let i = 0; i < pages.length; i++) {
			const page = pages[i];
			onProgress?.(i, pages.length, page.url);

			const result = await this.analyzePage(page);
			results.push(result);

			// Small delay between pages (100ms)
			if (i < pages.length - 1) {
				await new Promise((r) => setTimeout(r, 100));
			}
		}

		onProgress?.(pages.length, pages.length, "Complete");
		return results;
	}

	// ─── Generate crawl narrative ─────────────────────
	async generateCrawlNarrative(
		stats: Parameters<typeof prompts.buildCrawlNarrativeRequest>[0],
	): Promise<string> {
		const resp = await this.router.complete(
			prompts.buildCrawlNarrativeRequest(stats),
		);
		return resp.text;
	}

	// ─── Content Originality (t3-content-originality) ─
	async computeOriginalityScores(results: PageAIResult[]): Promise<void> {
		const pageEmbeds = results.filter(
			(r) => r.embeddings && r.embeddings.length > 0,
		);
		if (pageEmbeds.length < 2) {
			results.forEach((r) => (r.originalityScore = 100));
			return;
		}

		const cosineSimilarity = (a: number[], b: number[]) => {
			let dot = 0,
				mA = 0,
				mB = 0;
			for (let i = 0; i < a.length; i++) {
				dot += a[i] * b[i];
				mA += a[i] * a[i];
				mB += b[i] * b[i];
			}
			return dot / (Math.sqrt(mA) * Math.sqrt(mB));
		};

		for (const res of results) {
			if (!res.embeddings || res.embeddings.length === 0) {
				res.originalityScore = 100;
				continue;
			}

			const similarities: number[] = [];
			for (const other of pageEmbeds) {
				if (other.url === res.url) continue;
				similarities.push(cosineSimilarity(res.embeddings, other.embeddings!));
			}

			// Sort similarities descending
			similarities.sort((a, b) => b - a);

			// Avg similarity of top 5 most similar pages
			const topN = similarities.slice(0, 5);
			const avgSim =
				topN.length > 0 ? topN.reduce((a, b) => a + b, 0) / topN.length : 0;

			// Originality = 100 - (avgSimilarity * 100)
			// We clip it and map it to a more useful range
			res.originalityScore = Math.max(
				0,
				Math.min(100, Math.round(100 - avgSim * 100)),
			);
		}
	}

	// ─── Content Decay Prediction (t3-content-decay) ──
	detectContentDecay(
		page: { gscClicks?: number; gscImpressions?: number; ga4Sessions?: number },
		previousData?: {
			gscClicks?: number;
			gscImpressions?: number;
			ga4Sessions?: number;
		},
	): {
		decay: "unknown" | "Decaying" | "Possible Decay" | "Growing" | "Stable";
		velocity: number;
	} {
		if (!previousData) return { decay: "unknown", velocity: 0 };

		const clickDelta = (page.gscClicks || 0) - (previousData.gscClicks || 0);
		const impressionDelta =
			(page.gscImpressions || 0) - (previousData.gscImpressions || 0);
		const sessionDelta =
			(page.ga4Sessions || 0) - (previousData.ga4Sessions || 0);

		const clickDecline = previousData.gscClicks
			? (clickDelta / previousData.gscClicks) * 100
			: 0;
		const impressionDecline = previousData.gscImpressions
			? (impressionDelta / previousData.gscImpressions) * 100
			: 0;
		const sessionDecline = previousData.ga4Sessions
			? (sessionDelta / previousData.ga4Sessions) * 100
			: 0;

		const points = [clickDecline, impressionDecline, sessionDecline].filter(
			(v) => Number.isFinite(v),
		);
		const avgDecline =
			points.length > 0
				? points.reduce((sum, value) => sum + value, 0) / points.length
				: 0;

		if (avgDecline < -30) return { decay: "Decaying", velocity: avgDecline };
		if (avgDecline < -15)
			return { decay: "Possible Decay", velocity: avgDecline };
		if (avgDecline > 15) return { decay: "Growing", velocity: avgDecline };
		return { decay: "Stable", velocity: avgDecline };
	}

	async analyzeGrammar(
		text: string,
	): Promise<{ errors: number; details: string[] }> {
		const response = await this.router.complete({
			taskType: "extract",
			systemPrompt:
				'You are a grammar checker. Find grammatical errors in the text. Return JSON: {"errors": number, "details": ["error description 1", ...]}',
			prompt: `Check this text for grammar errors:\n\n${text.substring(0, 3000)}`,
			maxTokens: 512,
			format: "json",
		});
		try {
			return JSON.parse(response.text);
		} catch {
			return { errors: 0, details: [] };
		}
	}

	// ─── Keyword Opportunity (t3-keyword-opportunity) ─
	calculateKeywordOpportunity(page: {
		gscImpressions?: number;
		gscPosition?: number;
		gscCtr?: number;
	}): number {
		const impressions = page.gscImpressions || 0;
		const position = page.gscPosition || 100;
		const ctr = page.gscCtr || 0;

		let score = 0;
		if (position >= 4 && position <= 20) score += 30;
		if (position >= 4 && position <= 10) score += 20; // bonus for page 1 bottom
		if (impressions > 500) score += 20;
		if (impressions > 2000) score += 15;
		if (ctr < 0.03 && impressions > 100) score += 15; // low CTR = meta needs work
		return Math.min(100, score);
	}
}
