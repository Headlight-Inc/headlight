import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/technical/OverviewTab'
import { IndexingTab } from '../../components/seo-crawler/right-sidebar/modes/technical/IndexingTab'
import { PerformanceTab } from '../../components/seo-crawler/right-sidebar/modes/technical/PerformanceTab'
import { SecurityTab } from '../../components/seo-crawler/right-sidebar/modes/technical/SecurityTab'
import { CrawlabilityTab } from '../../components/seo-crawler/right-sidebar/modes/technical/CrawlabilityTab'

export interface TechnicalStats {
	overallScore: number
	totalPages: number
	htmlPages: number
	radar: Array<{ axis: string; value: number }>
	indexability: {
		indexed: number
		blocked: number
		noindex: number
		canonicalized: number
	}
	performance: {
		good: number
		needsImpr: number
		poor: number
		avgLcp: number
		avgFid: number
		avgCls: number
	}
	security: {
		https: number
		http: number
		hsts: number
		missingHeaders: number
	}
	crawlability: {
		depthDistribution: Array<{ name: string; value: number }>
		avgDepth: number
		internalLinks: number
		brokenLinks: number
	}
}

export function computeTechnicalStats(pages: any[]): TechnicalStats {
	const total = pages.length || 1
	const html = pages.filter(p => p.contentType?.includes('html'))
	const htmlCount = html.length || 1

	const stats: TechnicalStats = {
		overallScore: 82, // Mock for now
		totalPages: pages.length,
		htmlPages: html.length,
		radar: [
			{ axis: 'Index', value: 85 },
			{ axis: 'Speed', value: 72 },
			{ axis: 'Security', value: 95 },
			{ axis: 'Crawl', value: 80 },
			{ axis: 'Schema', value: 65 },
		],
		indexability: {
			indexed: pages.filter(p => p.indexabilityStatus === 'Indexable').length,
			blocked: pages.filter(p => p.indexabilityStatus === 'Blocked').length,
			noindex: pages.filter(p => p.indexabilityStatus === 'Noindex').length,
			canonicalized: pages.filter(p => p.indexabilityStatus === 'Canonicalized').length,
		},
		performance: {
			good: html.filter(p => p.speedScore === 'Good').length,
			needsImpr: html.filter(p => p.speedScore === 'Needs Improvement').length,
			poor: html.filter(p => p.speedScore === 'Poor').length,
			avgLcp: 1.8,
			avgFid: 45,
			avgCls: 0.08,
		},
		security: {
			https: pages.filter(p => p.url.startsWith('https')).length,
			http: pages.filter(p => p.url.startsWith('http:')).length,
			hsts: pages.filter(p => p.hsts).length,
			missingHeaders: html.filter(p => !p.hasSecurityHeaders).length,
		},
		crawlability: {
			depthDistribution: [
				{ name: '1-2', value: pages.filter(p => p.crawlDepth <= 2).length },
				{ name: '3-5', value: pages.filter(p => p.crawlDepth > 2 && p.crawlDepth <= 5).length },
				{ name: '6+', value: pages.filter(p => p.crawlDepth > 5).length },
			],
			avgDepth: pages.reduce((s, p) => s + (p.crawlDepth || 0), 0) / total,
			internalLinks: pages.reduce((s, p) => s + (p.inlinks?.length || 0), 0),
			brokenLinks: pages.reduce((s, p) => s + (p.outlinks?.filter((l: any) => l.isBroken)?.length || 0), 0),
		}
	}

	return stats
}

export const technicalBundle: RsModeBundle<TechnicalStats> = {
	modeId: 'technical',
	computeStats: ({ pages }: RsDataDeps) => computeTechnicalStats(pages as any[]),
	tabs: {
		tech_overview: OverviewTab,
		tech_indexing: IndexingTab,
		tech_performance: PerformanceTab,
		tech_security: SecurityTab,
		tech_crawl: CrawlabilityTab,
	},
}
