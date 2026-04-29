import React from 'react';
import { useSeoCrawler } from '../../../contexts/SeoCrawlerContext';
import FaOverviewTab from './tabs/FaOverviewTab';
import FaIssuesTab from './tabs/FaIssuesTab';
import FaScoresTab from './tabs/FaScoresTab';
import FaCrawlTab from './tabs/FaCrawlTab';
import FaIntegrationsTab from './tabs/FaIntegrationsTab';

export default function FaSidebarRouter() {
    const { faSidebarTab } = useSeoCrawler();

    switch (faSidebarTab) {
        case 'fa_overview': return <FaOverviewTab />;
        case 'fa_issues':   return <FaIssuesTab />;
        case 'fa_scores':   return <FaScoresTab />;
        case 'fa_crawl':    return <FaCrawlTab />;
        case 'fa_integrations': return <FaIntegrationsTab />;
        default: return <FaOverviewTab />;
    }
}
