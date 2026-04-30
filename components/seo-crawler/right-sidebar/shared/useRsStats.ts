// components/seo-crawler/right-sidebar/shared/useRsStats.ts
import { useMemo } from 'react'
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext'
import { getRsBundle } from '../../../../services/right-sidebar/registry'
import type { RsDataDeps } from '../../../../services/right-sidebar/types'

/**
 * Hook to consume computed sidebar stats for the current mode.
 * Returns the result of computeStats() for the active bundle.
 */
export function useRsStats<T = any>(modeKey?: string) {
  const c = useSeoCrawler()
  
  // Use current mode from context if not specified
  const mode = modeKey || c.mode
  const bundle = getRsBundle(mode as any)
  
  const deps: RsDataDeps = useMemo(() => ({
    pages: c.pages, 
    industry: (c as any).industry, // industry might be in context but not in type
    domain: (c as any).domain,
    filters: c.pageFilter?.selections ?? {}, 
    integrationConnections: c.integrationConnections ?? {},
    wqaState: c.wqaState ?? {}, 
    wqaFilter: c.wqaFilter,
  }), [c.pages, (c as any).industry, (c as any).domain, c.pageFilter, c.integrationConnections, c.wqaState, c.wqaFilter])

  const stats = useMemo(() => {
    if (!bundle) return null
    try { 
      return bundle.computeStats(deps) as T 
    } catch (e) { 
      console.error('[useRsStats] computeStats failed', e)
      return null 
    }
  }, [bundle, deps])

  return stats
}
