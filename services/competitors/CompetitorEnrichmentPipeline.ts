import {
	CompetitorProfile,
	createEmptyProfile,
} from "../CompetitorMatrixConfig";
import { analyzeSitemap } from "./SitemapIntelligence";
import { getDomainIntel } from "./RdapService";
import { getDnsIntelligence } from "./DnsIntelligence";
import { getWaybackIntelligence } from "./WaybackService";
import { getPageSpeedData } from "./PsiService";
import { scrapeTrustpilot } from "./TrustpilotScraper";
import { scrapeSpyFu } from "./scrapers/SpyFuScraper";
import { scrapeAhrefs } from "./scrapers/AhrefsScraper";
import { scrapeMoz } from "./scrapers/MozScraper";
import { scrapeMajestic } from "./scrapers/MajesticScraper";
import { scrapeSimilarWeb } from "./scrapers/SimilarWebScraper";
import { scrapeSemrush } from "./scrapers/SemrushScraper";
import { scrapeUbersuggest } from "./scrapers/UbersuggestScraper";
import {
	scrapeG2,
	scrapeCapterra,
	scrapeGoogleReviews,
} from "./scrapers/ReviewScrapers";
import {
	scrapeYouTube,
	scrapeTwitterViaNitter,
	scrapeInstagram,
	scrapeTikTok,
} from "./scrapers/SocialScrapers";
import {
	scrapeGoogleSiteCount,
	checkKnowledgePanel,
	checkPressCoverage,
	checkDirectoryCitations,
} from "./scrapers/GoogleSerpScraper";
import { mergeInto } from "./DataOrchestrator";
import { applyFallbacks } from "./InternalFallbacks";
import { sleep } from "./scrapers/shared";

export interface EnrichmentContext {
	domain: string;
	profile: Partial<CompetitorProfile>;
	fetchFn?: (url: string) => Promise<string>;
	userApiKeys?: {
		psi?: string;
		youtube?: string;
		googlePlaces?: string;
		facebook?: string;
		twitter?: string;
	};
	onProgress?: (phase: string, pct: number, msg: string) => void;
}

export async function runPhaseA(ctx: EnrichmentContext): Promise<void> {
	const { domain, profile, onProgress } = ctx;
	onProgress?.("A", 0, "Analyzing sitemap...");

	const results = await Promise.allSettled([
		analyzeSitemap(domain),
		getDomainIntel(domain),
		getDnsIntelligence(domain),
		getWaybackIntelligence(domain),
		scrapeTrustpilot(domain),
	]);

	const names = ["sitemap", "rdap", "dns", "wayback", "trustpilot"];
	results.forEach((r, i) => {
		if (r.status === "fulfilled" && r.value)
			mergeInto(profile, r.value, names[i]);
	});

	try {
		const robotsResp = await fetch(`https://${domain}/robots.txt`, {
			signal: AbortSignal.timeout(5000),
		});
		if (robotsResp.ok) {
			const robotsTxt = await robotsResp.text();
			const blocked = [
				"GPTBot",
				"Google-Extended",
				"CCBot",
				"anthropic-ai",
				"ClaudeBot",
			].filter(
				(bot) =>
					robotsTxt
						.toLowerCase()
						.includes(`user-agent: ${bot.toLowerCase()}`) &&
					robotsTxt.toLowerCase().includes("disallow: /"),
			);
			if (blocked.length >= 4) profile.aiBotAccessPolicy = "blocked";
			else if (blocked.length >= 1) profile.aiBotAccessPolicy = "partial";
			else profile.aiBotAccessPolicy = "open";
		}
	} catch {
		// ignore
	}

	try {
		const llmsResp = await fetch(`https://${domain}/llms.txt`, {
			signal: AbortSignal.timeout(3000),
		});
		profile.hasLlmsTxt = llmsResp.ok;
	} catch {
		profile.hasLlmsTxt = false;
	}

	profile.lastEnrichmentPhase = "A";
	profile.dataConfidence = "low";
	onProgress?.("A", 100, "Phase A complete");
}

export async function runPhaseB(ctx: EnrichmentContext): Promise<void> {
	const { domain, profile, fetchFn, onProgress } = ctx;
	if (!fetchFn) return;

	onProgress?.("B", 0, "Quick scanning homepage...");

	try {
		const html = await fetchFn(`https://${domain}`);
		mergeInto(profile, parseHomepageQuick(html, domain), "homepage-scan");
	} catch {
		// ignore
	}

	onProgress?.("B", 33, "Checking Google index...");
	try {
		mergeInto(
			profile,
			await scrapeGoogleSiteCount(domain, fetchFn),
			"google-site",
		);
	} catch {
		// ignore
	}

	await sleep(1500);

	onProgress?.("B", 66, "Checking knowledge panel...");
	if (profile.businessName) {
		try {
			mergeInto(
				profile,
				await checkKnowledgePanel(profile.businessName, fetchFn),
				"google-kp",
			);
		} catch {
			// ignore
		}
	}

	profile.lastEnrichmentPhase = "B";
	profile.dataConfidence = "low";
	onProgress?.("B", 100, "Phase B complete");
}

export async function runPhaseC(ctx: EnrichmentContext): Promise<void> {
	const { domain, profile, fetchFn, onProgress } = ctx;
	if (!fetchFn) return;

	const sources = [
		{ name: "SpyFu", fn: () => scrapeSpyFu(domain, fetchFn), delay: 4000 },
		{ name: "Ahrefs", fn: () => scrapeAhrefs(domain, fetchFn), delay: 5000 },
		{ name: "Moz", fn: () => scrapeMoz(domain, fetchFn), delay: 5000 },
		{
			name: "Majestic",
			fn: () => scrapeMajestic(domain, fetchFn),
			delay: 8000,
		},
		{
			name: "SimilarWeb",
			fn: () => scrapeSimilarWeb(domain, fetchFn),
			delay: 6000,
		},
		{ name: "SEMrush", fn: () => scrapeSemrush(domain, fetchFn), delay: 5000 },
		{
			name: "Ubersuggest",
			fn: () => scrapeUbersuggest(domain, fetchFn),
			delay: 5000,
		},
	];

	const businessName = profile.businessName || domain.split(".")[0];
	const reviewSources = [
		{ name: "G2", fn: () => scrapeG2(businessName, fetchFn), delay: 5000 },
		{
			name: "Capterra",
			fn: () => scrapeCapterra(businessName, fetchFn),
			delay: 5000,
		},
		{
			name: "Google Reviews",
			fn: () => scrapeGoogleReviews(businessName, fetchFn),
			delay: 3000,
		},
	];

	const socialSources = [
		profile.youtubeUrl
			? {
					name: "YouTube",
					fn: () => scrapeYouTube(profile.youtubeUrl!, fetchFn),
					delay: 3000,
				}
			: null,
		profile.twitterUrl
			? {
					name: "Twitter",
					fn: () => scrapeTwitterViaNitter(profile.twitterUrl!, fetchFn),
					delay: 3000,
				}
			: null,
		profile.instagramUrl
			? {
					name: "Instagram",
					fn: () => scrapeInstagram(profile.instagramUrl!, fetchFn),
					delay: 3000,
				}
			: null,
		profile.tiktokUrl
			? {
					name: "TikTok",
					fn: () => scrapeTikTok(profile.tiktokUrl!, fetchFn),
					delay: 3000,
				}
			: null,
	].filter(Boolean) as Array<{
		name: string;
		fn: () => Promise<Partial<CompetitorProfile>>;
		delay: number;
	}>;

	const localSources = [
		{
			name: "Press Coverage",
			fn: () => checkPressCoverage(businessName, fetchFn),
			delay: 2000,
		},
		{
			name: "Directory Citations",
			fn: () => checkDirectoryCitations(businessName, fetchFn),
			delay: 6000,
		},
	];

	const allSources = [
		...sources,
		...reviewSources,
		...socialSources,
		...localSources,
	];
	const total = allSources.length;
	const trafficEstimates = new Map<string, number>();
	const kwEstimates = new Map<string, number>();
	const rdEstimates = new Map<string, number>();

	for (let i = 0; i < allSources.length; i++) {
		const source = allSources[i];
		const pct = Math.round(((i + 1) / total) * 100);
		onProgress?.("C", pct, `Scraping ${source.name}...`);

		try {
			const data = await source.fn();
			if (data.estimatedOrganicTraffic)
				trafficEstimates.set(source.name, data.estimatedOrganicTraffic);
			if (data.totalRankingKeywords)
				kwEstimates.set(source.name, data.totalRankingKeywords);
			if (data.referringDomains)
				rdEstimates.set(source.name, data.referringDomains);
			mergeInto(profile, data, source.name.toLowerCase().replace(/\s+/g, "-"));
		} catch (err) {
			console.warn(`[Pipeline] ${source.name} failed:`, err);
		}

		if (i < allSources.length - 1) await sleep(source.delay);
	}

	if (trafficEstimates.size >= 2) {
		const values = [...trafficEstimates.values()];
		profile.estimatedOrganicTraffic = Math.round(
			values.reduce((a, b) => a + b, 0) / values.length,
		);
	}
	if (kwEstimates.size >= 2) {
		const values = [...kwEstimates.values()];
		profile.totalRankingKeywords = Math.round(
			values.reduce((a, b) => a + b, 0) / values.length,
		);
	}
	if (rdEstimates.size >= 2) {
		const values = [...rdEstimates.values()];
		profile.referringDomains = Math.round(
			values.reduce((a, b) => a + b, 0) / values.length,
		);
	}

	profile.lastEnrichmentPhase = "C";
	profile.dataConfidence =
		(profile.dataSourcesUsed?.length || 0) >= 5 ? "medium" : "low";
	onProgress?.("C", 100, "Phase C complete");
}

export async function runPhaseD(
	ctx: EnrichmentContext,
	crawlPages: any[],
): Promise<void> {
	const { profile, onProgress } = ctx;
	onProgress?.("D", 0, "Processing crawl results...");

	const { CompetitorProfileBuilder } =
		await import("../CompetitorProfileBuilder");
	const crawlProfile = CompetitorProfileBuilder.fromCrawlPages(
		ctx.domain,
		crawlPages,
	);
	mergeInto(profile, crawlProfile, "full-crawl");

	profile.lastEnrichmentPhase = "D";
	profile.dataConfidence = "high";
	profile._meta = {
		...profile._meta!,
		crawledAt: Date.now(),
		pagesCrawled: crawlPages.length,
		source: "full-crawl",
	};

	onProgress?.("D", 100, "Phase D complete");
}

export async function runPhaseE(ctx: EnrichmentContext): Promise<void> {
	const { domain, profile, userApiKeys, onProgress } = ctx;
	onProgress?.("E", 0, "Running PageSpeed Insights...");
	try {
		mergeInto(profile, await getPageSpeedData(domain, userApiKeys?.psi), "psi");
	} catch {
		// ignore
	}
	profile.lastEnrichmentPhase = "E";
	onProgress?.("E", 100, "Phase E complete");
}

export function runPhaseF(ctx: EnrichmentContext): void {
	const { profile } = ctx;
	applyFallbacks(profile);
	const sources = profile.dataSourcesUsed?.length || 0;
	if (sources >= 8) profile.dataConfidence = "high";
	else if (sources >= 4) profile.dataConfidence = "medium";
	else profile.dataConfidence = "low";
	profile.lastEnrichmentPhase = "F";
}

export async function runFullEnrichment(
	domain: string,
	fetchFn?: (url: string) => Promise<string>,
	userApiKeys?: EnrichmentContext["userApiKeys"],
	onProgress?: EnrichmentContext["onProgress"],
): Promise<CompetitorProfile> {
	const profile: Partial<CompetitorProfile> = createEmptyProfile(domain);
	const ctx: EnrichmentContext = {
		domain,
		profile,
		fetchFn,
		userApiKeys,
		onProgress,
	};

	await runPhaseA(ctx);
	await runPhaseE(ctx);
	if (fetchFn) {
		await runPhaseB(ctx);
		await runPhaseC(ctx);
	}
	runPhaseF(ctx);

	return profile as CompetitorProfile;
}

function parseHomepageQuick(
	html: string,
	_domain: string,
): Partial<CompetitorProfile> {
	const result: Partial<CompetitorProfile> = {};
	const lower = html.toLowerCase();

	const socialPatterns: Array<{
		key: keyof CompetitorProfile;
		pattern: RegExp;
	}> = [
		{
			key: "facebookUrl",
			pattern: /href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/i,
		},
		{
			key: "twitterUrl",
			pattern: /href="(https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"]+)"/i,
		},
		{
			key: "instagramUrl",
			pattern: /href="(https?:\/\/(?:www\.)?instagram\.com\/[^"]+)"/i,
		},
		{
			key: "youtubeUrl",
			pattern:
				/href="(https?:\/\/(?:www\.)?youtube\.com\/(?:c(?:hannel)?\/|@)[^"]+)"/i,
		},
		{
			key: "linkedinUrl",
			pattern: /href="(https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"]+)"/i,
		},
		{
			key: "tiktokUrl",
			pattern: /href="(https?:\/\/(?:www\.)?tiktok\.com\/@[^"]+)"/i,
		},
	];

	for (const { key, pattern } of socialPatterns) {
		const match = html.match(pattern);
		if (match) (result as any)[key] = match[1];
	}

	if (lower.includes("wp-content") || lower.includes("wp-includes"))
		result.cmsType = "WordPress";
	else if (lower.includes("shopify")) result.cmsType = "Shopify";
	else if (lower.includes("squarespace")) result.cmsType = "Squarespace";
	else if (lower.includes("wix.com")) result.cmsType = "Wix";
	else if (lower.includes("webflow")) result.cmsType = "Webflow";
	else if (lower.includes("ghost")) result.cmsType = "Ghost";
	else if (lower.includes("drupal")) result.cmsType = "Drupal";
	else if (lower.includes("joomla")) result.cmsType = "Joomla";

	const stack: string[] = [];
	if (result.cmsType) stack.push(result.cmsType);
	if (lower.includes("react") || lower.includes("__next")) stack.push("React");
	if (lower.includes("vue")) stack.push("Vue");
	if (lower.includes("angular")) stack.push("Angular");
	if (lower.includes("svelte")) stack.push("Svelte");
	if (lower.includes("tailwind")) stack.push("Tailwind CSS");
	if (lower.includes("bootstrap")) stack.push("Bootstrap");
	if (lower.includes("jquery")) stack.push("jQuery");
	if (
		lower.includes("gtag") ||
		lower.includes("google-analytics") ||
		lower.includes("googletagmanager")
	)
		stack.push("Google Analytics");
	if (lower.includes("hotjar")) stack.push("Hotjar");
	if (lower.includes("segment")) stack.push("Segment");
	if (lower.includes("hubspot")) stack.push("HubSpot");
	if (lower.includes("intercom")) stack.push("Intercom");
	if (lower.includes("drift")) stack.push("Drift");
	if (lower.includes("zendesk")) stack.push("Zendesk");
	if (stack.length > 0) result.techStackSignals = stack;

	result.hasLiveChat =
		lower.includes("intercom") ||
		lower.includes("drift") ||
		lower.includes("zendesk") ||
		lower.includes("crisp") ||
		lower.includes("tidio") ||
		lower.includes("livechat") ||
		lower.includes("tawk");
	result.hasEmailOptIn =
		lower.includes('type="email"') && lower.includes("subscribe");
	result.hasFreeTrial =
		lower.includes("free trial") ||
		lower.includes("start free") ||
		lower.includes("try free") ||
		lower.includes("freemium");

	const adPlatforms: string[] = [];
	if (
		lower.includes("googleads") ||
		lower.includes("google_conversion") ||
		lower.includes("gtag('event',")
	)
		adPlatforms.push("Google Ads");
	if (
		lower.includes("fbevents") ||
		lower.includes("facebook.com/tr") ||
		lower.includes("fbq(")
	)
		adPlatforms.push("Meta Pixel");
	if (lower.includes("linkedin.com/px") || lower.includes("snap.licdn.com"))
		adPlatforms.push("LinkedIn Insight");
	if (lower.includes("tiktok.com/i18n/pixel")) adPlatforms.push("TikTok Pixel");
	if (lower.includes("ads.twitter.com") || lower.includes("twq("))
		adPlatforms.push("Twitter Pixel");
	if (adPlatforms.length > 0) result.adPlatformsDetected = adPlatforms;

	result.hasConversionTracking =
		lower.includes("conversion") &&
		(lower.includes("gtag") || lower.includes("fbq"));
	result.hasRemarketingTags =
		lower.includes("remarketing") ||
		lower.includes("retargeting") ||
		lower.includes("adroll") ||
		lower.includes("criteo");

	const adDivs = (
		html.match(/googlesyndication|adsense|ad-slot|data-ad/gi) || []
	).length;
	result.displayAdsCount = adDivs > 0 ? Math.ceil(adDivs / 2) : 0;

	const jsonLds =
		html.match(
			/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
		) || [];
	for (const block of jsonLds) {
		try {
			const json = JSON.parse(
				block.replace(/<script[^>]*>/, "").replace(/<\/script>/, ""),
			);
			if (json["@type"] === "Organization" && json.name)
				result.businessName = json.name;
			if (Array.isArray(json.sameAs)) {
				for (const url of json.sameAs) {
					if (url.includes("facebook.com") && !result.facebookUrl)
						result.facebookUrl = url;
					if (
						(url.includes("twitter.com") || url.includes("x.com")) &&
						!result.twitterUrl
					)
						result.twitterUrl = url;
					if (url.includes("instagram.com") && !result.instagramUrl)
						result.instagramUrl = url;
					if (url.includes("youtube.com") && !result.youtubeUrl)
						result.youtubeUrl = url;
					if (url.includes("linkedin.com") && !result.linkedinUrl)
						result.linkedinUrl = url;
					if (url.includes("tiktok.com") && !result.tiktokUrl)
						result.tiktokUrl = url;
				}
			}
		} catch {
			// ignore malformed JSON-LD
		}
	}

	return result;
}
