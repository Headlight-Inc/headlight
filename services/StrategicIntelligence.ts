/**
 * StrategicIntelligence.ts
 * 
 * Provides enterprise-grade SEO metrics:
 * - Internal PageRank (Link Equity)
 * - Semantic Gap Analysis
 * - Health Scoring Models
 */

export interface PageRankNode {
    url: string;
    outlinks: string[];
    rank: number;
}

/**
 * Calculates Internal PageRank for a set of pages.
 * Now includes weighted distribution based on external signals (GSC/GA4).
 * This ensures that high-traffic pages are recognized as authority hubs.
 */
export function calculateInternalPageRank(
    pages: any[], 
    iterations: number = 10, 
    damping: number = 0.85
): Record<string, number> {
    const nodes: Record<string, PageRankNode> = {};
    const totalPages = pages.length;
    if (totalPages === 0) return {};

    // 1. Initialize nodes with weighted importance based on traffic
    pages.forEach(p => {
        // Boost initial rank for pages with proven traffic (GSC)
        const trafficBoost = p.gscClicks ? Math.log10(p.gscClicks + 10) : 1;
        nodes[p.url] = {
            url: p.url,
            outlinks: p.outlinksList || [],
            rank: (1 / totalPages) * trafficBoost
        };
    });

    // 2. Iterate
    for (let i = 0; i < iterations; i++) {
        const nextRanks: Record<string, number> = {};
        let sinkRank = 0;

        for (const url in nodes) {
            const node = nodes[url];
            if (node.outlinks.length > 0) {
                const share = node.rank / node.outlinks.length;
                node.outlinks.forEach(outTarget => {
                    if (nodes[outTarget]) {
                        nextRanks[outTarget] = (nextRanks[outTarget] || 0) + share;
                    }
                });
            } else {
                sinkRank += node.rank;
            }
        }

        const baseRank = (1 - damping) / totalPages;
        const sinkRedistribution = (damping * sinkRank) / totalPages;

        for (const url in nodes) {
            nodes[url].rank = baseRank + sinkRedistribution + (damping * (nextRanks[url] || 0));
        }
    }

    const ranks = Object.values(nodes).map(n => n.rank);
    const maxRank = Math.max(...ranks);
    const minRank = Math.min(...ranks);
    const range = maxRank - minRank || 1;

    const normalized: Record<string, number> = {};
    for (const url in nodes) {
        // Normalize to 0-100 scale for UI readability
        normalized[url] = Number(((nodes[url].rank / maxRank) * 100).toFixed(2));
    }

    return normalized;
}

/**
 * Content Decay Detection
 * Flags pages that have high impressions but low CTR, indicating potentially outdated or irrelevant content.
 */
export function detectContentDecay(page: any): boolean {
    const clicks = page.gscClicks || 0;
    const impressions = page.gscImpressions || 0;
    
    if (impressions > 100) {
        const ctr = (clicks / impressions);
        return ctr < 0.02; // Threshold: 2% CTR
    }
    return false;
}

/**
 * Cannibalization Detection
 * Group pages by title/H1 similarity to identify potential internal competition.
 */
export function detectCannibalization(pages: any[]): Record<string, string[]> {
    const titleGroups: Record<string, string[]> = {};
    const cannibalized: Record<string, string[]> = {};

    pages.forEach(p => {
        const key = (p.title || p.h1_1 || '').toLowerCase().trim();
        if (key && key.length > 10) { // Only check significant titles
            if (!titleGroups[key]) titleGroups[key] = [];
            titleGroups[key].push(p.url);
        }
    });

    for (const key in titleGroups) {
        if (titleGroups[key].length > 1) {
            titleGroups[key].forEach(url => {
                cannibalized[url] = titleGroups[key].filter(u => u !== url);
            });
        }
    }

    return cannibalized;
}

/**
 * Predictive Traffic Impact
 * Estimates potential click gains if technical/content issues on a page are fixed.
 */
export function calculatePredictiveTrafficImpact(page: any): number {
    const currentClicks = page.gscClicks || 0;
    const impressions = page.gscImpressions || 1;
    const currentCtr = currentClicks / impressions;
    
    let potentialCtrBoost = 0;

    // Fixed Meta Description -> ~15% boost in CTR
    if (!page.metaDesc) potentialCtrBoost += 0.15;
    
    // Fixed Title -> ~20% boost in CTR
    if (!page.title) potentialCtrBoost += 0.20;

    // Improved Core Web Vitals (Load Time) -> ~5% boost in Rank/CTR
    if (page.loadTime > 2500) potentialCtrBoost += 0.05;

    // Fixing 404 (if we're redirecting to an equivalent page) -> Restore full traffic
    if (page.statusCode === 404) return Math.round(impressions * 0.05); // Estimate 5% conversion from impressions if restored

    const estimatedNewCtr = Math.min(0.3, currentCtr * (1 + potentialCtrBoost));
    const estimatedNewClicks = Math.round(impressions * estimatedNewCtr);
    
    return Math.max(0, estimatedNewClicks - currentClicks);
}

/**
 * Predictive Health Scoring
 * Combines technical, content, and link metrics into a single score.
 */
export function calculatePredictiveScore(page: any): number {
    let score = 100;

    // Technical Penalties
    if (page.statusCode >= 400) score -= 50;
    else if (page.statusCode >= 300) score -= 20;
    
    if (page.loadTime > 2000) score -= 15;
    if (page.sizeBytes > 2 * 1024 * 1024) score -= 10;
    
    // SEO Penalties
    if (!page.title) score -= 15;
    if (!page.metaDesc) score -= 10;
    if (!page.h1_1) score -= 10;
    
    // Indexability
    if (page.indexable === false) score -= 30;
    
    // Content Quality
    if (page.isThinContent) score -= 25;
    if (page.hasKeywordStuffing) score -= 30;
    if (page.containsLoremIpsum) score -= 40;
    if (page.textRatio < 10) score -= 10;
    if (page.wordCount < 100 && page.statusCode === 200) score -= 30; // Destructive thin content
    
    // Authority (PageRank Integration)
    if (page.internalPageRank !== undefined) {
        if (page.internalPageRank < 5) score -= 10; // Low-flow pages
        else if (page.internalPageRank > 70) score += 5; // Reward authority hubs
    }

    // UX & Accessibility
    if (page.missingAltImages > 0) score -= 5;
    if (page.mixedContent) score -= 20;

    // Content Decay Check
    if (detectContentDecay(page)) score -= 15;

    return Math.max(0, Math.min(100, score));
}

