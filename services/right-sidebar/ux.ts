import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/ux/OverviewTab'
import { PerformanceTab } from '../../components/seo-crawler/right-sidebar/modes/ux/PerformanceTab'
import { AccessibilityTab } from '../../components/seo-crawler/right-sidebar/modes/ux/AccessibilityTab'
import { ConversionsTab } from '../../components/seo-crawler/right-sidebar/modes/ux/ConversionsTab'
import { ActionsTab } from '../../components/seo-crawler/right-sidebar/modes/ux/ActionsTab'

export interface UxStats {
	overallScore: number
	coreWebVitals: {
		lcp: number
		inp: number
		cls: number
	}
	accessibilityScore: number
	conversionRate: number
}

export function computeUxStats({ pages }: RsDataDeps): UxStats {
	return {
		overallScore: 75,
		coreWebVitals: {
			lcp: 2.1,
			inp: 120,
			cls: 0.05,
		},
		accessibilityScore: 88,
		conversionRate: 2.4,
	}
}

export const uxBundle: RsModeBundle<UxStats> = {
	modeId: 'uxConversion',
	computeStats: computeUxStats,
	tabs: {
		ux_overview: OverviewTab,
		ux_performance: PerformanceTab,
		ux_accessibility: AccessibilityTab,
		ux_conversions: ConversionsTab,
		ux_actions: ActionsTab,
	},
}
