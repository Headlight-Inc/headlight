import type { WqaSiteStats, WqaActionGroup } from './WebsiteQualityModeTypes';
import type { DetectedIndustry } from './SiteTypeDetector';
import { scoreToGrade } from './WebsiteQualityModeTypes';

/** 
 * Frozen export for UI compatibility. 
 * Resolves action groups from the pages in memory.
 */
export function computeWqaActionGroups(pages: any[]): WqaActionGroup[] {
    const actions: any[] = [];
    
    pages.forEach(p => {
        if (p.technicalAction && p.technicalAction !== 'Monitor') {
            actions.push({
                code: p.technicalActionCode || 'T99',
                action: p.technicalAction,
                reason: p.technicalActionReason || '',
                priority: p.technicalActionPriority || 3,
                estimatedImpact: p.technicalActionImpact || 0,
                effort: p.technicalActionEffort || 'medium',
                category: 'technical',
                url: p.url,
                pagePath: p.pagePath || p.url,
                pageCategory: p.pageCategory,
                impressions: p.gscImpressions || 0,
                clicks: p.gscClicks || 0,
                position: p.gscPosition || 0
            });
        }
        if (p.contentAction && p.contentAction !== 'No Action') {
            actions.push({
                code: p.contentActionCode || 'C99',
                action: p.contentAction,
                reason: p.contentActionReason || '',
                priority: p.contentActionPriority || 3,
                estimatedImpact: p.contentActionImpact || 0,
                effort: p.contentActionEffort || 'medium',
                category: 'content',
                url: p.url,
                pagePath: p.pagePath || p.url,
                pageCategory: p.pageCategory,
                impressions: p.gscImpressions || 0,
                clicks: p.gscClicks || 0,
                position: p.gscPosition || 0
            });
        }
    });

	return transformActionsToGroups(actions);
}


export function transformActionsToGroups(actions: any[]): WqaActionGroup[] {
    const byKey = new Map<string, WqaActionGroup>();
	
    for (const a of actions) {
		const cat = categoryFor(a.code || a.action);
		const k = `${cat}|${a.code || a.action}`;
		if (!byKey.has(k)) {
			byKey.set(k, {
				category: cat as any,
				action: a.code || a.action,
				pageCount: 0,
				totalEstimatedImpact: 0,
                avgPriority: 0,
                reason: a.reason || '',
                effort: a.effort || 'medium',
				pages: [],
			});
		}
		const g = byKey.get(k)!;
		g.pageCount++;
        g.totalEstimatedImpact += (a.estimatedImpact || 0);
        // Simplified priority average
        g.avgPriority = (g.avgPriority * (g.pageCount - 1) + (a.priority || 3)) / g.pageCount;

		if (a.scope === 'page' || a.url) {
            g.pages.push({ 
                url: a.scopeId || a.url, 
                pagePath: a.pagePath || '',
                pageCategory: a.pageCategory || '',
                impressions: a.impressions || 0,
                clicks: a.clicks || 0,
                sessions: a.sessions || 0,
                position: a.position || 0,
                ctr: a.ctr || 0,
                estimatedImpact: a.estimatedImpact || 0 
            });
        }
	}
	return [...byKey.values()].sort((a, b) => (a.avgPriority - b.avgPriority) || b.pageCount - a.pageCount);
}

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

export function deriveWqaScore(stats: WqaSiteStats): { score: number; grade: string } {
    const score = Math.round(stats.avgHealthScore || 0);
    return {
        score,
        grade: scoreToGrade(score)
    };
}

function categoryFor(code: string): string {
	if (code.startsWith('C'))  return 'content';
	if (code.startsWith('T'))  return 'technical';
	if (code.startsWith('L'))  return 'links';
	if (code.startsWith('S'))  return 'structured';
	if (code.startsWith('A'))  return 'ai';
	if (code.startsWith('P'))  return 'performance';
	if (code.startsWith('U'))  return 'ux';
	if (code.startsWith('SO')) return 'social';
	if (code.startsWith('E'))  return 'commerce';
	return 'industry';
}
