import React, { Suspense, lazy } from 'react'
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext'
import { getMode } from '@headlight/modes'
import { RsEmpty } from './RsEmpty'

// Full audit
const FullOverview     = lazy(() => import('./tabs/full-audit/OverviewTab'))
const FullIssues       = lazy(() => import('./tabs/full-audit/IssuesTab'))
const FullScores       = lazy(() => import('./tabs/full-audit/ScoresTab'))
const FullCrawlHealth  = lazy(() => import('./tabs/full-audit/CrawlHealthTab'))
const FullIntegrations = lazy(() => import('./tabs/full-audit/IntegrationsTab'))

const REGISTRY: Record<string, React.LazyExoticComponent<React.FC>> = {
    full_overview:     FullOverview,
    full_issues:       FullIssues,
    full_scores:       FullScores,
    full_crawl:        FullCrawlHealth,
    full_integrations: FullIntegrations,
}

export function RsRouter() {
    const { mode, rsTab: rsTabByMode, pages, crawlRuntime } = useSeoCrawler()
    let tabs: ReadonlyArray<{ id: string; label: string }> = []
    try { tabs = getMode(mode).rsTabs } catch {}

    const activeId = rsTabByMode?.[mode] || tabs[0]?.id
    const Cmp = activeId ? REGISTRY[activeId] : undefined

    if (!pages || pages.length === 0) {
        if (crawlRuntime?.stage !== 'idle') {
            return <RsEmpty title="Crawling…" body="Insights will land here as URLs come back." pulse />
        }
        return <RsEmpty title="No pages yet" body="Run a crawl to populate this side panel." />
    }

    if (!Cmp) {
        return <RsEmpty title="Insights coming soon" body={`No panel registered for ${activeId || 'this tab'} yet.`} />
    }
    return (
        <Suspense fallback={<RsEmpty title="Loading" body="Crunching the numbers..." pulse />}>
            <Cmp />
        </Suspense>
    )
}
