// shared/useRsStats.ts
import { useMemo } from 'react'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'
import { getRsBundle } from '../../../../services/right-sidebar/registry'
import type { RsDataDeps } from '../../../../services/right-sidebar/types'

export function useRsStats<T = unknown>() {
  const c = useSeoCrawler()
  const bundle = getRsBundle(c.mode)
  const deps: RsDataDeps = useMemo(() => ({
    pages: c.pages, industry: c.industry, domain: c.domain,
    filters: c.filters ?? {}, integrationConnections: c.integrationConnections ?? {},
    wqaState: c.wqaState ?? {}, wqaFilter: c.wqaFilter,
  }), [c.pages, c.industry, c.domain, c.filters, c.integrationConnections, c.wqaState, c.wqaFilter])
  const stats = useMemo(() => {
    if (!bundle) return null
    try { return bundle.computeStats(deps) as T } catch { return null }
  }, [bundle, deps])
  return { bundle, stats, deps }
}
