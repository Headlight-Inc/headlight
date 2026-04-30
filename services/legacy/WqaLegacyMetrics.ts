import {
  countWhere, isThin, pct,
} from '../right-sidebar/_helpers'
import { WqaSiteStats, WqaActionGroup, scoreToGrade } from '../WebsiteQualityModeTypes'

export function computeWqaSiteStats(pages: any[], industry: any): WqaSiteStats {
	const n = pages.length;
	const indexed = countWhere(pages, p => p.isIndexed !== false);
	
	const categories: Record<string, number> = {};
	pages.forEach(p => {
		const cat = p.pageCategory || 'Other';
		categories[cat] = (categories[cat] || 0) + 1;
	});

	const stats: WqaSiteStats = {
		totalPages: n,
		indexedPages: indexed,
		sitemapPages: countWhere(pages, p => p.inSitemap === true),
		htmlPages: countWhere(pages, p => p.contentType?.includes('html')),
		totalImpressions: pages.reduce((s, p) => s + (p.gscImpressions || 0), 0),
		totalClicks: pages.reduce((s, p) => s + (p.gscClicks || 0), 0),
		totalSessions: pages.reduce((s, p) => s + (p.ga4Sessions || 0), 0),
		avgPosition: n ? pages.reduce((s, p) => s + (p.gscPosition || 0), 0) / n : 0,
		avgCtr: n ? (pages.reduce((s, p) => s + (p.gscCtr || 0), 0) / n) * 100 : 0,
		totalRevenue: pages.reduce((s, p) => s + (p.ga4Revenue || 0), 0),
		totalTransactions: pages.reduce((s, p) => s + (p.ga4Transactions || 0), 0),
		totalGoalCompletions: pages.reduce((s, p) => s + (p.ga4Conversions || 0), 0),
		totalPageviews: pages.reduce((s, p) => s + (p.ga4Views || 0), 0),
		totalSubscribers: pages.reduce((s, p) => s + (p.ga4Subscribers || 0), 0),
		duplicateRate: pct(countWhere(pages, p => !!p.isDuplicate), n),
		orphanRate: pct(countWhere(pages, p => (p.inlinks || 0) === 0), n),
		thinContentRate: pct(countWhere(pages, isThin), n),
		brokenRate: pct(countWhere(pages, p => (p.status || 0) >= 400), n),
		schemaCoverage: pct(countWhere(pages, p => (p.schemaTypes?.length || 0) > 0), n),
		sitemapCoverage: pct(countWhere(pages, p => p.inSitemap === true), n),
		avgHealthScore: 0, // computed below
		avgContentQuality: pct(countWhere(pages, p => (p.wordCount || 0) > 500), n),
		avgSpeedScore: pct(countWhere(pages, p => (p.loadTime || 0) < 1500), n),
		avgEeat: 50,
		radarContent: pct(countWhere(pages, p => !!p.title && !!p.metaDesc), n),
		radarSeo: pct(indexed, n),
		radarAuthority: 50,
		radarUx: pct(countWhere(pages, p => (p.loadTime || 0) < 2500), n),
		radarSearchPerf: pct(countWhere(pages, p => (p.gscPosition || 100) <= 20), n),
		radarTrust: pct(countWhere(pages, p => (p.url || '').startsWith('https')), n),
		highValuePages: countWhere(pages, p => (p.internalPageRank || 0) >= 8),
		mediumValuePages: countWhere(pages, p => (p.internalPageRank || 0) >= 5 && (p.internalPageRank || 0) < 8),
		lowValuePages: countWhere(pages, p => (p.internalPageRank || 0) > 0 && (p.internalPageRank || 0) < 5),
		zeroValuePages: countWhere(pages, p => (p.internalPageRank || 0) === 0),
		pagesWithTechAction: countWhere(pages, p => (p.status || 0) >= 400 || (p.loadTime || 0) > 3000),
		pagesWithContentAction: countWhere(pages, isThin),
		pagesNoAction: 0,
		totalEstimatedImpact: 0,
		pagesLosingTraffic: countWhere(pages, p => !!p.isLosingTraffic),
		pagesWithZeroImpressions: countWhere(pages, p => (p.gscImpressions || 0) === 0 && (p.isIndexed !== false)),
		orphanPagesWithValue: countWhere(pages, p => (p.inlinks || 0) === 0 && (p.gscImpressions || 0) > 50),
		cannibalizationCount: countWhere(pages, p => !!p.isCannibalized),
		pagesInStrikingDistance: countWhere(pages, p => (p.gscPosition || 0) >= 4 && (p.gscPosition || 0) <= 20),
		pagesGoodSpeed: countWhere(pages, p => (p.loadTime || 0) < 1000),
		pagesByCategory: categories,
		newsSitemapCoverage: 0,
		decayRiskCount: countWhere(pages, p => !!p.isLosingTraffic),
		industryStats: null
	};
	stats.avgHealthScore = (stats.radarContent + stats.radarSeo + stats.radarUx + stats.radarTrust) / 4;
	stats.pagesNoAction = n - (stats.pagesWithTechAction + stats.pagesWithContentAction);
	return stats;
}

export function computeWqaActionGroups(pages: any[]): WqaActionGroup[] {
	const groups: Record<string, WqaActionGroup> = {};
	const add = (action: string, category: 'technical' | 'content' | 'industry', p: any, impact: number, effort: 'low'|'medium'|'high', reason: string) => {
		if (!groups[action]) {
			groups[action] = { action, category, pageCount: 0, totalEstimatedImpact: 0, avgPriority: 2, effort, reason, pages: [] };
		}
		groups[action].pageCount++;
		groups[action].totalEstimatedImpact += impact;
		if (groups[action].pages.length < 5) {
			groups[action].pages.push({
				url: p.url, pagePath: p.url, pageCategory: p.pageCategory || 'Other',
				impressions: p.gscImpressions || 0, clicks: p.gscClicks || 0, sessions: p.ga4Sessions || 0,
				position: p.gscPosition || 0, ctr: p.gscCtr || 0, estimatedImpact: impact
			});
		}
	};

	pages.forEach(p => {
		if ((p.status || 0) >= 400) add('Fix broken pages', 'technical', p, 10, 'low', 'Returning error status');
		if (isThin(p)) add('Expand thin content', 'content', p, 5, 'medium', 'Less than 300 words');
		if (!p.title) add('Add missing titles', 'content', p, 8, 'low', 'Empty title tag');
		if ((p.loadTime || 0) > 2500) add('Improve page speed', 'technical', p, 12, 'high', 'Load time > 2.5s');
	});

	return Object.values(groups);
}

export function deriveWqaScore(stats: WqaSiteStats) {
	const score = Math.round(stats.avgHealthScore);
	return { score, grade: scoreToGrade(score) };
}

export function transformActionsToGroups(actions: any[]): WqaActionGroup[] {
	return actions.map(a => ({
		action: a.label, category: 'technical', pageCount: a.impact, totalEstimatedImpact: a.impact * 10,
		avgPriority: 2, effort: a.effort, reason: 'High impact fix', pages: []
	}));
}
