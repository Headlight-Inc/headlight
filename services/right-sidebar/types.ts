import type { ModeId } from '@headlight/modes'
import type { CrawledPage } from '@/types/crawler'
import type { IndustryFilter } from '@/services/AuditModeConfig'

export type RsTabId = string // ids come from mode.rsTabs[].id

export interface RsDataDeps {
	pages: ReadonlyArray<CrawledPage>
	industry: IndustryFilter
	filters: Record<string, unknown>
	domain: string
}

export interface RsTabProps<TStats = unknown> {
	deps: RsDataDeps
	stats: TStats
}

export type RsTabRenderer<TStats = unknown> = React.ComponentType<
	RsTabProps<TStats>
>

export interface RsModeBundle<TStats = unknown> {
	modeId: ModeId
	computeStats: (deps: RsDataDeps) => TStats
	tabs: Record<RsTabId, RsTabRenderer<TStats>>
}
