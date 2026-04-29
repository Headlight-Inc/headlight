import type { DetectedIndustry } from '../../SiteTypeDetector'
import type { WqaSiteStats } from '../../WebsiteQualityModeTypes'

export function computeWqaSiteStats(pages: any[], industry: DetectedIndustry): WqaSiteStats {
    const stats: WqaSiteStats = {
        totalPages: pages.length,
        indexedPages: pages.filter(p => p.indexabilityStatus === 'Indexable').length,
        sitemapPages: pages.filter(p => p.inSitemap).length,
        htmlPages: pages.filter(p => p.contentType?.includes('html')).length,
        totalImpressions: pages.reduce((s, p) => s + (p.gscImpressions || 0), 0),
        totalClicks: pages.reduce((s, p) => s + (p.gscClicks || 0), 0),
        totalSessions: pages.reduce((s, p) => s + (p.ga4Sessions || 0), 0),
        avgPosition: pages.filter(p => p.gscPosition > 0).reduce((s, p) => s + p.gscPosition, 0) / Math.max(1, pages.filter(p => p.gscPosition > 0).length),
        avgCtr: pages.filter(p => p.gscImpressions > 0).reduce((s, p) => s + (p.gscCtr || 0), 0) / Math.max(1, pages.filter(p => p.gscImpressions > 0).length),
        totalRevenue: pages.reduce((s, p) => s + (p.ga4Revenue || 0), 0),
        totalTransactions: pages.reduce((s, p) => s + (p.ga4Transactions || 0), 0),
        totalGoalCompletions: pages.reduce((s, p) => s + (p.ga4GoalCompletions || 0), 0),
        totalPageviews: pages.reduce((s, p) => s + (p.ga4Views || 0), 0),
        totalSubscribers: pages.reduce((s, p) => s + (p.ga4Subscribers || 0), 0),
        duplicateRate: pages.filter(p => p.isDuplicate).length / Math.max(1, pages.length),
        orphanRate: pages.filter(p => (p.inlinks || []).length === 0).length / Math.max(1, pages.length),
        thinContentRate: pages.filter(p => p.wordCount < 300).length / Math.max(1, pages.length),
        brokenRate: pages.filter(p => p.statusCode >= 400).length / Math.max(1, pages.length),
        schemaCoverage: pages.filter(p => (p.schemaTypes || []).length > 0).length / Math.max(1, pages.length),
        sitemapCoverage: pages.filter(p => p.inSitemap).length / Math.max(1, pages.length),
        avgHealthScore: pages.reduce((s, p) => s + (p.healthScore || 0), 0) / Math.max(1, pages.length),
        avgContentQuality: pages.reduce((s, p) => s + (p.contentQualityScore || 0), 0) / Math.max(1, pages.length),
        avgSpeedScore: pages.reduce((s, p) => s + (p.speedScore === 'Good' ? 100 : p.speedScore === 'Needs Improvement' ? 50 : 0), 0) / Math.max(1, pages.length),
        avgEeat: pages.reduce((s, p) => s + (p.eeatScore || 0), 0) / Math.max(1, pages.length),
        radarContent: 70, // Mock for now
        radarSeo: 80,
        radarAuthority: 60,
        radarUx: 75,
        radarSearchPerf: 65,
        radarTrust: 85,
        highValuePages: pages.filter(p => p.pageValueTier === 'High').length,
        mediumValuePages: pages.filter(p => p.pageValueTier === 'Medium').length,
        lowValuePages: pages.filter(p => p.pageValueTier === 'Low').length,
        zeroValuePages: pages.filter(p => p.pageValueTier === 'None' || !p.pageValueTier).length,
        pagesWithTechAction: pages.filter(p => p.technicalAction && p.technicalAction !== 'Monitor').length,
        pagesWithContentAction: pages.filter(p => p.contentAction && p.contentAction !== 'No Action').length,
        pagesNoAction: pages.filter(p => p.primaryAction === 'Monitor').length,
        totalEstimatedImpact: pages.reduce((s, p) => s + (p.estimatedImpact || 0), 0),
        pagesLosingTraffic: pages.filter(p => p.isLosingTraffic).length,
        pagesWithZeroImpressions: pages.filter(p => p.gscImpressions === 0).length,
        orphanPagesWithValue: pages.filter(p => (p.inlinks || []).length === 0 && (p.gscImpressions > 50 || p.ga4Sessions > 20)).length,
        cannibalizationCount: pages.filter(p => p.isCannibalized).length,
        pagesInStrikingDistance: pages.filter(p => p.gscPosition >= 4 && p.gscPosition <= 20 && p.gscImpressions > 100).length,
        pagesGoodSpeed: pages.filter(p => p.speedScore === 'Good').length,
        pagesByCategory: {},
        newsSitemapCoverage: 0,
        decayRiskCount: pages.filter(p => p.contentDecayRisk > 0.7).length,
        industryStats: null
    };

    // Aggregate by category
    pages.forEach(p => {
        const cat = p.pageCategory || 'Unknown';
        stats.pagesByCategory[cat] = (stats.pagesByCategory[cat] || 0) + 1;
    });

    return stats;
}
