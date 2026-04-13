/**
 * CompetitorDiscoveryService.ts
 *
 * Free competitor discovery and analysis using:
 * 1. External link neighborhoods from crawl data
 * 2. GSC shared-query domains (who ranks for your keywords)
 * 3. Lightweight competitor micro-crawls via Ghost Engine
 *
 * All processing happens on the user's browser — zero server cost.
 */

export interface DiscoveredCompetitor {
    domain: string;
    url: string;
    name: string;
    source: 'link-neighborhood' | 'gsc-overlap' | 'micro-crawl';
    linkCount?: number;
    sharedKeywords?: number;
    estimatedAuthority?: number;
    confidence: 'high' | 'medium' | 'low';
}

export interface CompetitorInsight {
    domain: string;
    commonKeywords: string[];
    uniqueKeywords: string[];
    avgPosition?: number;
    totalPages?: number;
    topPages?: Array<{ url: string; title: string }>;
}

// ─── Link Neighborhood Discovery ────────────────────────────

/**
 * Discover competitors from your crawl's external link pattern.
 * Sites that appear frequently in your outgoing links (and aren't social media / CDNs)
 * are likely in your space.
 */
export function discoverFromLinkNeighborhood(
    crawlPages: any[],
    ownDomain: string
): DiscoveredCompetitor[] {
    const domainStats = new Map<string, { count: number; pages: Set<string> }>();

    for (const page of crawlPages) {
        const links = page.externalLinks || [];
        for (const link of links) {
            try {
                const domain = new URL(link).hostname.replace(/^www\./, '');
                if (isExcludedDomain(domain) || domain === ownDomain) continue;

                const entry = domainStats.get(domain) || { count: 0, pages: new Set() };
                entry.count++;
                entry.pages.add(page.url);
                domainStats.set(domain, entry);
            } catch { /* skip bad URLs */ }
        }
    }

    return [...domainStats.entries()]
        .filter(([, stats]) => stats.count >= 2) // At least 2 links to be considered
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([domain, stats]) => ({
            domain,
            url: `https://${domain}`,
            name: formatDomainName(domain),
            source: 'link-neighborhood' as const,
            linkCount: stats.count,
            estimatedAuthority: Math.min(100, Math.round(stats.count * 3 + stats.pages.size * 5)),
            confidence: stats.count >= 5 ? 'high' as const : stats.count >= 3 ? 'medium' as const : 'low' as const,
        }));
}

// ─── GSC Overlap Discovery ──────────────────────────────────

/**
 * When GSC data is available, find domains that likely rank for your keywords.
 * This uses your own GSC query data + position data to find competing domains.
 * 
 * NOTE: Full SERP competitor discovery requires actual SERP scraping.
 * This is a lighter approach that uses the queries you already have.
 */
export function analyzeCompetitorOverlap(
    yourPages: any[],
    competitorPages: any[]
): CompetitorInsight {
    const yourKeywords = new Set<string>();
    const yourTitles = new Map<string, string>();

    for (const page of yourPages) {
        const keyword = extractCleanKeyword(page.title);
        if (keyword) {
            yourKeywords.add(keyword.toLowerCase());
            yourTitles.set(keyword.toLowerCase(), page.title);
        }
    }

    const competitorKeywords = new Set<string>();
    const commonKeywords: string[] = [];
    const uniqueKeywords: string[] = [];
    const topPages: Array<{ url: string; title: string }> = [];

    for (const page of competitorPages) {
        const keyword = extractCleanKeyword(page.title);
        if (!keyword) continue;
        competitorKeywords.add(keyword.toLowerCase());
        topPages.push({ url: page.url, title: page.title || '' });

        if (yourKeywords.has(keyword.toLowerCase())) {
            commonKeywords.push(keyword);
        } else {
            uniqueKeywords.push(keyword);
        }
    }

    let competitorDomain = '';
    try {
        competitorDomain = new URL(competitorPages[0]?.url || '').hostname.replace(/^www\./, '');
    } catch { /* ignore */ }

    return {
        domain: competitorDomain,
        commonKeywords: commonKeywords.slice(0, 20),
        uniqueKeywords: uniqueKeywords.slice(0, 30),
        totalPages: competitorPages.length,
        topPages: topPages.slice(0, 10),
    };
}

// ─── Competitor Micro-Crawl Plan ────────────────────────────

/**
 * Generate a crawl plan for a competitor.
 * This returns the config needed to run a lightweight Ghost Engine crawl
 * (10-20 pages only) on the user's machine.
 */
export function buildCompetitorCrawlPlan(competitorUrl: string) {
    const normalizedUrl = competitorUrl.startsWith('http')
        ? competitorUrl
        : `https://${competitorUrl}`;

    return {
        url: normalizedUrl,
        maxPages: 20,
        maxDepth: 2,
        respectRobots: true,
        mode: 'spider' as const,
        // Only extract what we need for keyword/content comparison
        extractionFocus: ['title', 'h1', 'h2', 'metaDesc', 'wordCount', 'contentType'],
        // Fast settings — no JS rendering, no images
        jsRendering: false,
        fetchImages: false,
        timeout: 8000,
    };
}

// ─── Full Discovery Pipeline ────────────────────────────────

/**
 * Run the full competitor discovery pipeline from crawl data.
 * Returns ranked competitors with confidence scores.
 */
export function runFullDiscovery(
    crawlPages: any[],
    ownDomain: string
): DiscoveredCompetitor[] {
    const linkCompetitors = discoverFromLinkNeighborhood(crawlPages, ownDomain);

    // Deduplicate and rank
    const seen = new Set<string>();
    const results: DiscoveredCompetitor[] = [];

    for (const comp of linkCompetitors) {
        if (!seen.has(comp.domain)) {
            seen.add(comp.domain);
            results.push(comp);
        }
    }

    return results;
}

// ─── Share of Voice Calculation ─────────────────────────────

/**
 * Computes Share of Voice: for keywords where both you and a competitor rank,
 * what % do you rank higher?
 * 
 * Uses GSC position data from crawled pages.
 * Returns 0-100 (100 = you outrank them on every shared keyword).
 */
export function computeShareOfVoice(
  yourPages: any[],
  competitorPages: any[]
): { shareOfVoice: number; sharedKeywordCount: number; winsCount: number } {
  // Build keyword → position maps from main keyword data
  const yourKwMap = new Map<string, number>();
  for (const p of yourPages) {
    const kw = (p.mainKeyword || '').toLowerCase().trim();
    if (kw && p.gscPosition && p.gscPosition > 0) {
      // Keep best (lowest) position per keyword
      const existing = yourKwMap.get(kw);
      if (!existing || p.gscPosition < existing) {
        yourKwMap.set(kw, p.gscPosition);
      }
    }
  }

  const compKwMap = new Map<string, number>();
  for (const p of competitorPages) {
    const kw = (p.mainKeyword || '').toLowerCase().trim();
    if (kw && p.gscPosition && p.gscPosition > 0) {
      const existing = compKwMap.get(kw);
      if (!existing || p.gscPosition < existing) {
        compKwMap.set(kw, p.gscPosition);
      }
    }
  }

  // Find shared keywords
  let shared = 0;
  let wins = 0;
  for (const [kw, yourPos] of yourKwMap) {
    const compPos = compKwMap.get(kw);
    if (compPos !== undefined) {
      shared++;
      if (yourPos < compPos) wins++; // lower position = better rank
    }
  }

  return {
    shareOfVoice: shared > 0 ? Math.round((wins / shared) * 100) : 0,
    sharedKeywordCount: shared,
    winsCount: wins,
  };
}

// ─── Threat Score Calculation ───────────────────────────────

/**
 * Computes composite threat scores for a competitor relative to you.
 * All scores 0-100 (higher = more threatening).
 */
export function computeThreatScores(
  yourProfile: any,
  competitorProfile: any
): {
  threatLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  contentThreatScore: number;
  authorityThreatScore: number;
  innovationThreatScore: number;
  opportunityAgainstThem: number;
} {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  // Content threat: they have more content, higher quality, faster publishing
  let contentThreat = 0;
  const yourPages = yourProfile.totalIndexablePages || 0;
  const compPages = competitorProfile.totalIndexablePages || 0;
  if (compPages > yourPages * 1.5) contentThreat += 30;
  else if (compPages > yourPages) contentThreat += 15;
  
  const yourPosts = yourProfile.blogPostsPerMonth || 0;
  const compPosts = competitorProfile.blogPostsPerMonth || 0;
  if (compPosts > yourPosts * 2) contentThreat += 30;
  else if (compPosts > yourPosts) contentThreat += 15;

  const yourQuality = ({ 'Excellent': 4, 'Good': 3, 'Average': 2, 'Poor': 1 } as any)[yourProfile.contentQualityAssessment || 'Average'] || 2;
  const compQuality = ({ 'Excellent': 4, 'Good': 3, 'Average': 2, 'Poor': 1 } as any)[competitorProfile.contentQualityAssessment || 'Average'] || 2;
  if (compQuality > yourQuality) contentThreat += 20;

  const yourFresh = yourProfile.contentFreshnessScore || 0;
  const compFresh = competitorProfile.contentFreshnessScore || 0;
  if (compFresh > yourFresh + 20) contentThreat += 20;

  // Authority threat: stronger backlink profile, higher DA
  let authorityThreat = 0;
  const yourRD = yourProfile.referringDomains || 0;
  const compRD = competitorProfile.referringDomains || 0;
  if (compRD > yourRD * 2) authorityThreat += 40;
  else if (compRD > yourRD * 1.3) authorityThreat += 20;
  else if (compRD > yourRD) authorityThreat += 10;

  const yourUR = yourProfile.urlRating || 0;
  const compUR = competitorProfile.urlRating || 0;
  if (compUR > yourUR + 20) authorityThreat += 30;
  else if (compUR > yourUR + 10) authorityThreat += 15;

  const yourVelocity = yourProfile.linkVelocity60d || 0;
  const compVelocity = competitorProfile.linkVelocity60d || 0;
  if (compVelocity > yourVelocity * 2) authorityThreat += 30;
  else if (compVelocity > yourVelocity) authorityThreat += 15;

  // Innovation threat: better tech, AI readiness, newer features
  let innovationThreat = 0;
  const yourTech = yourProfile.techHealthScore || 0;
  const compTech = competitorProfile.techHealthScore || 0;
  if (compTech > yourTech + 15) innovationThreat += 25;

  const yourGeo = yourProfile.avgGeoScore || 0;
  const compGeo = competitorProfile.avgGeoScore || 0;
  if (compGeo > yourGeo + 20) innovationThreat += 25;

  const yourSpeed = yourProfile.siteSpeedScore || 0;
  const compSpeed = competitorProfile.siteSpeedScore || 0;
  if (compSpeed > yourSpeed + 15) innovationThreat += 25;

  const yourSchema = yourProfile.schemaCoveragePct || 0;
  const compSchema = competitorProfile.schemaCoveragePct || 0;
  if (compSchema > yourSchema + 20) innovationThreat += 25;

  // Opportunity: where they are weak relative to you (inverse of their threat in each area)
  let opportunity = 0;
  if (yourPages > compPages * 1.3) opportunity += 20;
  if (yourRD > compRD * 1.3) opportunity += 20;
  if (yourTech > compTech + 10) opportunity += 20;
  if (yourGeo > compGeo + 15) opportunity += 20;
  if (yourQuality > compQuality) opportunity += 20;

  const contentThreatScore = clamp(contentThreat);
  const authorityThreatScore = clamp(authorityThreat);
  const innovationThreatScore = clamp(innovationThreat);
  const opportunityAgainstThem = clamp(opportunity);

  const avgThreat = (contentThreatScore + authorityThreatScore + innovationThreatScore) / 3;
  const threatLevel: 'Critical' | 'High' | 'Moderate' | 'Low' =
    avgThreat >= 70 ? 'Critical' :
    avgThreat >= 50 ? 'High' :
    avgThreat >= 30 ? 'Moderate' : 'Low';

  return { threatLevel, contentThreatScore, authorityThreatScore, innovationThreatScore, opportunityAgainstThem };
}


// ─── Helpers ─────────────────────────────────────────────────

function extractCleanKeyword(title?: string): string | null {
    if (!title || typeof title !== 'string') return null;
    let clean = title.split(/\s*[|\-–—]\s*/).slice(0, -1).join(' ').trim();
    if (!clean || clean.length < 3) clean = title.trim();
    clean = clean.replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    return clean.length > 80 ? clean.slice(0, 80) : (clean || null);
}

function formatDomainName(domain: string): string {
    // "example-site.com" → "Example Site"
    const name = domain.split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return name;
}

const EXCLUDED_DOMAINS = new Set([
    // Social / Media
    'google.com', 'facebook.com', 'twitter.com', 'x.com', 'youtube.com',
    'linkedin.com', 'instagram.com', 'pinterest.com', 'reddit.com',
    'tiktok.com', 'medium.com', 'quora.com',
    // Tech / CDN
    'github.com', 'stackoverflow.com', 'npmjs.com',
    'cloudflare.com', 'googleapis.com', 'gstatic.com', 'cdn.jsdelivr.net',
    'unpkg.com', 'cdnjs.cloudflare.com', 'maxcdn.bootstrapcdn.com',
    // Reference
    'wikipedia.org', 'w3.org', 'schema.org',
    // Big tech
    'apple.com', 'microsoft.com', 'amazon.com',
    // Tracking
    'googletagmanager.com', 'google-analytics.com', 'doubleclick.net',
    'facebook.net', 'fbcdn.net', 'hotjar.com', 'clarity.ms',
    // WordPress / CMS
    'gravatar.com', 'wp.com', 'wordpress.org', 'wordpress.com',
    // Fonts
    'fonts.googleapis.com', 'fonts.gstatic.com', 'use.typekit.net',
]);

function isExcludedDomain(domain: string): boolean {
    if (EXCLUDED_DOMAINS.has(domain)) return true;
    const parts = domain.split('.');
    if (parts.length > 2) {
        const parent = parts.slice(-2).join('.');
        return EXCLUDED_DOMAINS.has(parent);
    }
    return false;
}
