import * as React from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'
import { rsRegistry } from '../../../services/right-sidebar/registry'
import { RsEmpty } from './shared/empty'

export function RsRouter() {
	const { mode, rsTab, pages, industry, filters, domain } = useSeoCrawler()
	const desc = getMode(mode)
	const bundle = rsRegistry[mode]
	if (!desc || !bundle) return <RsEmpty message="This mode has no insights yet." />

	const tabId = rsTab[mode] ?? desc.rsTabs[0]?.id
	const Tab = bundle.tabs[tabId]
	if (!Tab) return <RsEmpty message="Unknown tab." />

	const deps = React.useMemo(
		() => ({ pages, industry, filters, domain }),
		[pages, industry, filters, domain],
	)
	const stats = React.useMemo(() => bundle.computeStats(deps), [bundle, deps])
	return <Tab deps={deps} stats={stats} />
}
