import type { RsTabDescriptor } from '../registry'
import { FullAuditOverview } from './FullAuditOverview'
import { FullAuditFixes }    from './FullAuditFixes'
import { FullAuditSearch }   from './FullAuditSearch'
import { FullAuditTraffic }  from './FullAuditTraffic'
import { FullAuditTech }     from './FullAuditTech'
import { FullAuditLinks }    from './FullAuditLinks'
import { FullAuditAi }       from './FullAuditAi'

export const fullAuditTabs: RsTabDescriptor[] = [
	{ id: 'overview', label: 'Overview', Component: FullAuditOverview },
	{
		id: 'fixes', label: 'Fixes', Component: FullAuditFixes,
		badge: ({ pages }) => pages.filter((p: any) => Number(p.statusCode) >= 400 || Number(p.lcpMs) > 2500 || p.indexable === false).length || undefined,
	},
	{ id: 'search',  label: 'Search',  Component: FullAuditSearch },
	{ id: 'traffic', label: 'Traffic', Component: FullAuditTraffic },
	{ id: 'tech',    label: 'Tech',    Component: FullAuditTech },
	{ id: 'links',   label: 'Links',   Component: FullAuditLinks },
	{ id: 'ai',       label: 'AI',      Component: FullAuditAi },
]
