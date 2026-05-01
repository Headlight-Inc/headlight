import type { RsTabDescriptor } from '../registry'
import { ContentOverview } from './ContentOverview'
import { ContentTopics } from './ContentTopics'
import { ContentQuality } from './ContentQuality'
import { ContentEeat } from './ContentEeat'
import { ContentDuplication } from './ContentDuplication'
import { ContentFreshness } from './ContentFreshness'
import { ContentActions } from './ContentActions'

export const contentTabs: RsTabDescriptor[] = [
    { id: 'overview',    label: 'Overview',    Component: ContentOverview },
    { id: 'topics',      label: 'Topics',      Component: ContentTopics,
        badge: ({ pages }) => {
            const html = pages.filter((p: any) => p.isHtmlPage || String(p.contentType || '').includes('html'))
            const clusters = new Set(html.map((p: any) => p.topicCluster).filter(Boolean))
            const orphans = html.filter((p: any) => !p.topicCluster).length
            return orphans > 0 ? orphans : (clusters.size || undefined)
        },
    },
    { id: 'quality',     label: 'Quality',     Component: ContentQuality,
        badge: ({ pages }) => pages.filter((p: any) => Number(p.wordCount) < 300 || p.isThinContent).length || undefined,
    },
    { id: 'eeat',        label: 'E-E-A-T',     Component: ContentEeat },
    { id: 'duplication', label: 'Duplication', Component: ContentDuplication,
        badge: ({ pages }) => pages.filter((p: any) => p.isDuplicate || p.exactDuplicate || p.nearDuplicateMatch).length || undefined,
    },
    { id: 'freshness',   label: 'Freshness',   Component: ContentFreshness,
        badge: ({ pages }) => pages.filter((p: any) => Number(p.daysSinceUpdate) > 365).length || undefined,
    },
    { id: 'actions',     label: 'Actions',     Component: ContentActions,
        badge: ({ pages }) => {
            const n = pages.filter((p: any) => {
                if (p.contentAction) return true
                if (Number(p.wordCount) < 300) return true
                if (p.exactDuplicate) return true
                if (Number(p.daysSinceUpdate) > 540) return true
                return false
            }).length
            return n || undefined
        },
    },
]
