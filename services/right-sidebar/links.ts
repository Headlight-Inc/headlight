import type { RsDataDeps, RsModeBundle } from './types'
import { OverviewTab } from '../../components/seo-crawler/right-sidebar/modes/links/OverviewTab'
import { InternalTab } from '../../components/seo-crawler/right-sidebar/modes/links/InternalTab'
import { ExternalTab } from '../../components/seo-crawler/right-sidebar/modes/links/ExternalTab'
import { AuthorityTab } from '../../components/seo-crawler/right-sidebar/modes/links/AuthorityTab'
import { ActionsTab } from '../../components/seo-crawler/right-sidebar/modes/links/ActionsTab'

export interface LinksStats {
	overallScore: number
	internalCount: number
	externalCount: number
	authorityScore: number
	brokenCount: number
}

export function computeLinksStats({ pages }: RsDataDeps): LinksStats {
	return {
		overallScore: 82,
		internalCount: pages.reduce((s, p) => s + (p.inlinks?.length || 0), 0),
		externalCount: pages.reduce((s, p) => s + (p.outlinks?.filter((l: any) => !l.url.startsWith('/') && !l.url.includes(pages[0]?.domain))?.length || 0), 0),
		authorityScore: 68,
		brokenCount: pages.reduce((s, p) => s + (p.outlinks?.filter((l: any) => l.isBroken)?.length || 0), 0),
	}
}

export const linksBundle: RsModeBundle<LinksStats> = {
	modeId: 'linksAuthority',
	computeStats: computeLinksStats,
	tabs: {
		links_overview: OverviewTab,
		links_internal: InternalTab,
		links_external: ExternalTab,
		links_authority: AuthorityTab,
		links_actions: ActionsTab,
	},
}
