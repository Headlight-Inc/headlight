import * as React from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'
import { rsRegistry } from '../../../services/right-sidebar/registry'
import { RsEmpty } from './shared/empty'

export function RsRouter() {
  const { mode, rsTab, pages, wqaState, wqaFilter, domain } = useSeoCrawler()
  const desc = getMode(mode)
  const bundle = rsRegistry[mode]

  const industry = wqaState?.industryOverride ?? wqaState?.detectedIndustry ?? 'general'

  const deps = React.useMemo(
    () => ({ pages, industry, filters: wqaFilter ?? {}, domain }),
    [pages, industry, wqaFilter, domain],
  )
  const stats = React.useMemo(
    () => (bundle ? bundle.computeStats(deps as any) : null),
    [bundle, deps],
  )

  if (!desc || !bundle) return <RsEmpty message="No insights for this mode yet." />

  const tabId = rsTab[mode] ?? desc.rsTabs[0]?.id
  const Tab = bundle.tabs[tabId]
  if (!Tab || !stats) return <RsEmpty message="Tab unavailable." />

  return <Tab deps={deps as any} stats={stats as any} />
}
