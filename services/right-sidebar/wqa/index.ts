import type { RsDataDeps, RsModeBundle } from '../types'
import { OverviewTab } from '../../../components/seo-crawler/right-sidebar/modes/wqa/OverviewTab'
import { ActionsTab } from '../../../components/seo-crawler/right-sidebar/modes/wqa/ActionsTab'
import { SearchTab } from '../../../components/seo-crawler/right-sidebar/modes/wqa/SearchTab'
import { ContentTab } from '../../../components/seo-crawler/right-sidebar/modes/wqa/ContentTab'
import { TechTab } from '../../../components/seo-crawler/right-sidebar/modes/wqa/TechTab'
import { computeWqaSiteStats } from './stats'

export * from './types'
export * from './score'
export * from './actions'
export * from './stats'
export * from './selectors'
export * from './forecast'
export * from './ai-prompts'

export const wqaBundle: RsModeBundle = {
  modeId: 'wqa',
  computeStats: ({ pages, industry }: RsDataDeps) => computeWqaSiteStats(pages as any[], industry as any),
  tabs: {
    wqa_overview: OverviewTab,
    wqa_actions: ActionsTab,
    wqa_search: SearchTab,
    wqa_content: ContentTab,
    wqa_tech: TechTab,
  },
}
