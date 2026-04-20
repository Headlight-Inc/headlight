import { CompetitorProfile } from "../CompetitorMatrixConfig";

type FallbackFn = (p: Partial<CompetitorProfile>) => any;

export const FALLBACK_FORMULAS: Record<string, FallbackFn> = {
	estimatedOrganicTraffic: (p) => {
		const pages = p.totalIndexablePages || p.pagesIndexed || 0;
		return pages > 0 ? Math.round(pages * 3) : null;
	},
	totalRankingKeywords: (p) => {
		const pages = p.totalIndexablePages || 0;
		return pages > 0 ? Math.round(pages * 1.5) : null;
	},
	keywordsInTop3: (p) => {
		const t = p.totalRankingKeywords || 0;
		return t > 0 ? Math.round(t * 0.05) : null;
	},
	keywordsInTop8: (p) => {
		const t3 = p.keywordsInTop3 || 0;
		const t10 = p.keywordsInTop10 || 0;
		return t3 > 0 ? Math.round(t3 + (t10 - t3) * 0.6) : null;
	},
	keywordsInTop10: (p) => {
		const t = p.totalRankingKeywords || 0;
		return t > 0 ? Math.round(t * 0.15) : null;
	},
	keywordsInTop20: (p) => {
		const t = p.totalRankingKeywords || 0;
		return t > 0 ? Math.round(t * 0.3) : null;
	},
	avgOrganicPosition: (p) => {
		const t10 = p.keywordsInTop10 || 0;
		const total = p.totalRankingKeywords || 0;
		if (total === 0) return null;
		const ratio = t10 / total;
		if (ratio > 0.3) return 12;
		if (ratio > 0.15) return 22;
		if (ratio > 0.05) return 35;
		return 45;
	},
	brandedTrafficPct: (p) =>
		p.hasKnowledgePanel ? 40 : (p.domainAge || 0) > 5 ? 25 : 15,
	trafficTrend30d: (p) => {
		const cv = p.contentVelocityTrend || 0;
		if (cv > 20) return 5;
		if (cv > 0) return 2;
		if (cv < -20) return -5;
		return 0;
	},
	monthlyGrowthRate: (p) => p.trafficTrend30d,
	seTraffic: (p) => p.estimatedOrganicTraffic,
	seTrafficCost: (p) => {
		const t = p.estimatedOrganicTraffic || 0;
		return t > 0 ? Math.round(t * 1.5) : null;
	},
	contentEfficiency: (p) => {
		const t = p.estimatedOrganicTraffic || 0;
		const pg = p.totalIndexablePages || 0;
		return pg > 0 ? Math.round(t / pg) : null;
	},
	googleIndexedPages: (p) => p.totalIndexablePages || p.pagesIndexed || null,
	pagesIndexed: (p) => p.totalIndexablePages || null,
	brandedSearchVolume: (p) => {
		const followers = p.socialTotalFollowers || 0;
		return followers > 0 ? Math.round(followers * 0.01) : null;
	},
	featuredSnippetCount: (p) => {
		const faq = p.faqHowToCount || 0;
		return faq > 0 ? Math.round(faq * 0.3) : null;
	},
	serpFeatureCount: (p) => {
		const schema = p.schemaCoveragePct || 0;
		const pages = p.totalIndexablePages || 0;
		return schema > 0 && pages > 0
			? Math.round((pages * (schema / 100)) / 10)
			: null;
	},
	domainAuthority: (p) => {
		const rd = p.referringDomains || 0;
		return rd > 0 ? Math.min(100, Math.round(Math.log10(rd + 1) * 25)) : null;
	},
	urlRating: (p) => p.ahrefsDR || p.domainAuthority || null,
	ahrefsDR: (p) =>
		p.mozDA ? Math.round(p.mozDA * 0.95) : p.domainAuthority || null,
	mozDA: (p) =>
		p.ahrefsDR ? Math.round(p.ahrefsDR * 1.05) : p.domainAuthority || null,
	mozPA: (p) => {
		const da = p.mozDA || p.domainAuthority || 0;
		return da > 0 ? Math.round(da * 0.85) : null;
	},
	mozSpamScore: (p) => {
		const q = p.backlinkQualityScore || 50;
		return Math.max(0, 100 - q);
	},
	majesticTrustFlow: (p) => {
		const q = p.backlinkQualityScore || 0;
		return q > 0 ? Math.round(q * 0.6) : null;
	},
	majesticCitationFlow: (p) => {
		const bl = p.totalBacklinks || p.referringDomains || 0;
		return bl > 0 ? Math.min(100, Math.round(Math.log10(bl + 1) * 15)) : null;
	},
	totalBacklinks: (p) => {
		const rd = p.referringDomains || 0;
		return rd > 0 ? Math.round(rd * 3.5) : null;
	},
	referringDomains: (p) => {
		const bl = p.totalBacklinks || 0;
		return bl > 0 ? Math.round(bl / 3.5) : null;
	},
	backlinkQualityScore: (p) => {
		const da = p.domainAuthority || p.mozDA || p.ahrefsDR || 0;
		return da > 0 ? Math.min(100, Math.round(da * 0.8)) : null;
	},
	commonBacklinkDomains: (p) => {
		const rd = p.referringDomains || 0;
		return rd > 0 ? Math.round(rd * 0.12) : null;
	},
	avgRefDomainsToContentPages: (p) => {
		const rd = p.referringDomains || 0;
		const pg = p.totalIndexablePages || 0;
		return pg > 0 ? Math.round(rd / pg) : null;
	},
	linkVelocity60d: (p) => {
		const rd = p.referringDomains || 0;
		const age = p.domainAge || 1;
		return rd > 0 ? Math.round((rd / (age * 12)) * 2) : null;
	},
	overallSeoScore: (p) => {
		const th = p.techHealthScore || 50;
		const da = p.domainAuthority || 50;
		const cf = p.contentFreshnessScore || 50;
		const sc = p.schemaCoveragePct || 30;
		const sp = p.siteSpeedScore || 50;
		return Math.round(th * 0.25 + da * 0.25 + cf * 0.15 + sc * 0.1 + sp * 0.25);
	},
	techHealthScore: (p) => {
		const sp = p.siteSpeedScore || 50;
		const cw = p.cwvPassRate || 50;
		const mb = p.mobileFriendlinessScore || 50;
		const cr = p.crawlabilityScore || 50;
		return Math.round(sp * 0.3 + cw * 0.25 + mb * 0.2 + cr * 0.25);
	},
	siteSpeedScore: (p) => {
		const hasCdn = !!p.cdnProvider;
		const cms = (p.cmsType || "").toLowerCase();
		let base = 50;
		if (hasCdn) base += 15;
		if (cms.includes("shopify") || cms.includes("squarespace")) base += 10;
		if (cms.includes("wordpress")) base += 5;
		return Math.min(100, base);
	},
	cwvPassRate: (p) => {
		const sp = p.siteSpeedScore || 0;
		return sp > 0 ? Math.round(sp * 0.8) : null;
	},
	mobileFriendlinessScore: (p) => {
		const cms = (p.cmsType || "").toLowerCase();
		if (
			cms.includes("shopify") ||
			cms.includes("squarespace") ||
			cms.includes("wix")
		)
			return 85;
		if (cms.includes("wordpress")) return 75;
		return 65;
	},
	jsRenderDependencyPct: (p) => {
		const stack = (p.techStackSignals || []).map((s) => s.toLowerCase());
		if (stack.some((s) => /react|angular|vue|next|nuxt|svelte/.test(s)))
			return 65;
		if (stack.some((s) => /wordpress|php|drupal/.test(s))) return 8;
		return 30;
	},
	avgBounceRate: (p) => {
		const dur = p.avgSessionDuration || 0;
		if (dur > 120) return 40;
		if (dur > 60) return 55;
		return 60;
	},
	avgSessionDuration: (p) => {
		const words = p.avgContentLength || 500;
		return Math.round((words / 200) * 60);
	},
	pagesPerVisit: (p) => {
		const cms = (p.cmsType || "").toLowerCase();
		if (cms.includes("shopify")) return 4.5;
		if (cms.includes("wordpress")) return 2.0;
		return 3.0;
	},
	socialTotalFollowers: (p) =>
		(p.facebookFans || 0) +
			(p.twitterFollowers || 0) +
			(p.youtubeSubscribers || 0) +
			(p.instagramFollowers || 0) +
			(p.linkedinFollowers || 0) +
			(p.tiktokFollowers || 0) || null,
	socialGrowthRate: (p) => {
		const activity =
			(p.facebookUpdatesPerMonth || 0) +
			(p.twitterUpdatesPerMonth || 0) +
			(p.youtubeUpdatesPerMonth || 0);
		return activity > 0 ? Math.min(100, activity * 2) : null;
	},
	adsTrafficCost: (p) => {
		const t = p.adsTraffic || 0;
		return t > 0 ? Math.round(t * 1.5) : null;
	},
	ppcKeywordsCount: (p) => {
		const t = p.adsTraffic || 0;
		return t > 0 ? Math.round(t / 8) : 0;
	},
	aggregateReviewScore: (p) => {
		const scores: Array<{ s: number; c: number }> = [];
		if (p.trustpilotScore && p.trustpilotReviewCount)
			scores.push({ s: p.trustpilotScore, c: p.trustpilotReviewCount });
		if (p.g2Rating && p.g2ReviewCount)
			scores.push({ s: p.g2Rating, c: p.g2ReviewCount });
		if (p.capterraRating && p.capterraReviewCount)
			scores.push({ s: p.capterraRating, c: p.capterraReviewCount });
		if (p.googleReviewScore && p.googleReviewCount)
			scores.push({ s: p.googleReviewScore, c: p.googleReviewCount });
		if (scores.length === 0) return null;
		const totalC = scores.reduce((s, x) => s + x.c, 0);
		const weightedS = scores.reduce((s, x) => s + x.s * x.c, 0);
		return Math.round((weightedS / totalC) * 10) / 10;
	},
	aggregateReviewCount: (p) =>
		(p.trustpilotReviewCount || 0) +
			(p.g2ReviewCount || 0) +
			(p.capterraReviewCount || 0) +
			(p.googleReviewCount || 0) || null,
	reviewScoreAvg: (p) => p.aggregateReviewScore,
	threatLevel: (p) => {
		const score = p.overallSeoScore || 50;
		const t = p.estimatedOrganicTraffic || 0;
		if (t > 1000 && score > 80) return "Critical";
		if (t > 500 || score > 70) return "High";
		if (t > 100 || score > 50) return "Moderate";
		return "Low";
	},
	contentThreatScore: (p) => {
		const fr = p.contentFreshnessScore || 0;
		const vel = Math.max(0, p.contentVelocityTrend || 0);
		const q =
			p.contentQualityAssessment === "Excellent"
				? 90
				: p.contentQualityAssessment === "Good"
					? 70
					: p.contentQualityAssessment === "Average"
						? 40
						: 20;
		return Math.round(fr * 0.3 + vel * 0.3 + q * 0.4);
	},
	authorityThreatScore: (p) => {
		const da = p.domainAuthority || 0;
		const rd = p.referringDomains || 0;
		const rdScore = Math.min(100, Math.round(Math.log10(rd + 1) * 25));
		return Math.round(da * 0.6 + rdScore * 0.4);
	},
	innovationThreatScore: (p) => {
		let s = 0;
		if ((p.siteSpeedScore || 0) > 80) s += 25;
		if ((p.cwvPassRate || 0) > 80) s += 20;
		if (p.hasLlmsTxt) s += 15;
		if (p.aiBotAccessPolicy === "open") s += 10;
		if ((p.avgGeoScore || 0) > 70) s += 15;
		if ((p.jsRenderDependencyPct || 100) < 20) s += 15;
		return Math.min(100, s);
	},
	opportunityAgainstThem: (p) => Math.max(0, 100 - (p.overallSeoScore || 50)),
};

export function applyFallbacks(profile: Partial<CompetitorProfile>): void {
	for (let pass = 0; pass < 3; pass++) {
		for (const [key, formula] of Object.entries(FALLBACK_FORMULAS)) {
			const current = (profile as any)[key];
			if (current === null || current === undefined) {
				const value = formula(profile);
				if (value !== null && value !== undefined) {
					(profile as any)[key] = value;
				}
			}
		}
	}
}
