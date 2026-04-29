import type { ActionGroup, ActionCategory } from './types'

export function categoryFor(code: string): ActionCategory {
  if (!code) return 'industry'
  const c = code.toUpperCase()
  if (c.startsWith('SO')) return 'social'
  if (c.startsWith('C')) return 'content'
  if (c.startsWith('T')) return 'technical'
  if (c.startsWith('L')) return 'links'
  if (c.startsWith('S')) return 'structured'
  if (c.startsWith('A')) return 'ai'
  if (c.startsWith('P')) return 'performance'
  if (c.startsWith('U')) return 'ux'
  if (c.startsWith('E')) return 'commerce'
  return 'industry'
}

export function transformActionsToGroups(actions: any[]): ActionGroup[] {
  const byKey = new Map<string, ActionGroup>()
  for (const a of actions) {
    const code = a.code || a.action || 'X99'
    const cat = categoryFor(code)
    const k = `${cat}|${code}`
    if (!byKey.has(k)) {
      byKey.set(k, {
        code,
        action: a.action || code,
        category: cat,
        pageCount: 0,
        totalEstimatedImpact: 0,
        avgPriority: 0,
        reason: a.reason || '',
        effort: a.effort || 'medium',
        pages: [],
      })
    }
    const g = byKey.get(k)!
    g.pageCount++
    g.totalEstimatedImpact += Number(a.estimatedImpact || 0)
    g.avgPriority = (g.avgPriority * (g.pageCount - 1) + Number(a.priority || 3)) / g.pageCount
    if (a.url) {
      g.pages.push({
        url: a.url,
        pagePath: a.pagePath || a.url,
        pageCategory: a.pageCategory || '',
        impressions: Number(a.impressions || 0),
        clicks: Number(a.clicks || 0),
        sessions: Number(a.sessions || 0),
        position: Number(a.position || 0),
        ctr: Number(a.ctr || 0),
        estimatedImpact: Number(a.estimatedImpact || 0),
      })
    }
  }
  return [...byKey.values()].sort((a, b) =>
    (a.avgPriority - b.avgPriority) || (b.totalEstimatedImpact - a.totalEstimatedImpact),
  )
}

export function computeWqaActionGroups(pages: any[]): ActionGroup[] {
  const actions: any[] = []
  for (const p of pages) {
    if (p.technicalAction && p.technicalAction !== 'Monitor') {
      actions.push({
        code: p.technicalActionCode || 'T99',
        action: p.technicalAction,
        reason: p.technicalActionReason || '',
        priority: p.technicalActionPriority || 3,
        estimatedImpact: p.technicalActionImpact || 0,
        effort: p.technicalActionEffort || 'medium',
        url: p.url,
        pagePath: p.pagePath || p.url,
        pageCategory: p.pageCategory,
        impressions: p.gscImpressions || 0,
        clicks: p.gscClicks || 0,
        sessions: p.ga4Sessions || 0,
        position: p.gscPosition || 0,
        ctr: p.gscCtr || 0,
      })
    }
    if (p.contentAction && p.contentAction !== 'No Action') {
      actions.push({
        code: p.contentActionCode || 'C99',
        action: p.contentAction,
        reason: p.contentActionReason || '',
        priority: p.contentActionPriority || 3,
        estimatedImpact: p.contentActionImpact || 0,
        effort: p.contentActionEffort || 'medium',
        url: p.url,
        pagePath: p.pagePath || p.url,
        pageCategory: p.pageCategory,
        impressions: p.gscImpressions || 0,
        clicks: p.gscClicks || 0,
        sessions: p.ga4Sessions || 0,
        position: p.gscPosition || 0,
        ctr: p.gscCtr || 0,
      })
    }
  }
  return transformActionsToGroups(actions)
}
