import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/full-audit/OverviewTab'
import { TechTab } from '../../components/seo-crawler/right-sidebar/modes/full-audit/TechTab'
import { ContentTab } from '../../components/seo-crawler/right-sidebar/modes/full-audit/ContentTab'
import { LinksTab } from '../../components/seo-crawler/right-sidebar/modes/full-audit/LinksTab'
import { ActionsTab } from '../../components/seo-crawler/right-sidebar/modes/full-audit/ActionsTab'

export interface FullAuditStats {
	overallScore: number
	totalPages: number
	indexableCount: number
	healthPct: number
	errorCount: number
	radar: Array<{ axis: string; value: number }>
}

export function computeFullAuditStats({ pages }: RsDataDeps): FullAuditStats {
	const total = pages.length || 1
	const indexable = pages.filter(p => p.indexabilityStatus === 'Indexable').length
	const errors = pages.filter(p => p.statusClass === '4xx' || p.statusClass === '5xx').length

	return {
		overallScore: 84,
		totalPages: pages.length,
		indexableCount: indexable,
		healthPct: (total - errors) / total,
		errorCount: errors,
		radar: [
			{ axis: 'Tech', value: 88 },
			{ axis: 'Content', value: 76 },
			{ axis: 'Links', value: 92 },
			{ axis: 'UX', value: 81 },
			{ axis: 'AI', value: 65 },
		]
	}
}

export const fullAuditBundle: RsModeBundle<FullAuditStats> = {
	modeId: 'fullAudit',
	computeStats: computeFullAuditStats,
	tabs: {
		full_overview: OverviewTab,
		full_tech: TechTab,
		full_content: ContentTab,
		full_links: LinksTab,
		full_actions: ActionsTab,
	},
}
