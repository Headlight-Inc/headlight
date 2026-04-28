import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/content/OverviewTab'
import { KeywordsTab } from '../../components/seo-crawler/right-sidebar/modes/content/KeywordsTab'
import { ReadabilityTab } from '../../components/seo-crawler/right-sidebar/modes/content/ReadabilityTab'
import { IntentTab } from '../../components/seo-crawler/right-sidebar/modes/content/IntentTab'
import { GapsTab } from '../../components/seo-crawler/right-sidebar/modes/content/GapsTab'

export interface ContentStats {
	overallScore: number
	radar: Array<{ axis: string; value: number }>
	quality: {
		high: number
		medium: number
		low: number
	}
	keywords: {
		top: Array<{ label: string; value: number }>
		coverage: number
	}
	intent: {
		informational: number
		commercial: number
		transactional: number
		navigational: number
	}
}

export function computeContentStats(pages: any[]): ContentStats {
	return {
		overallScore: 78,
		radar: [
			{ axis: 'Quality', value: 82 },
			{ axis: 'Keywords', value: 65 },
			{ axis: 'Intent', value: 90 },
			{ axis: 'Readability', value: 75 },
			{ axis: 'Uniqueness', value: 88 },
		],
		quality: {
			high: pages.filter(p => p.contentQualityScore > 80).length,
			medium: pages.filter(p => p.contentQualityScore >= 50 && p.contentQualityScore <= 80).length,
			low: pages.filter(p => p.contentQualityScore < 50).length,
		},
		keywords: {
			top: [
				{ label: 'seo services', value: 450 },
				{ label: 'audit tool', value: 320 },
				{ label: 'crawler', value: 280 },
			],
			coverage: 72,
		},
		intent: {
			informational: 60,
			commercial: 25,
			transactional: 10,
			navigational: 5,
		}
	}
}

export const contentBundle: RsModeBundle<ContentStats> = {
	modeId: 'content',
	computeStats: ({ pages }: RsDataDeps) => computeContentStats(pages as any[]),
	tabs: {
		content_overview: OverviewTab,
		content_topics: KeywordsTab,
		content_quality: ReadabilityTab,
		content_authors: IntentTab,
		content_actions: GapsTab,
	},
}
