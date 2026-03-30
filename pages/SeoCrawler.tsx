import React from 'react';
import { SeoCrawlerProvider } from '../contexts/SeoCrawlerContext';
import CrawlerHeader from '../components/seo-crawler/CrawlerHeader';
import SiteExplorer from '../components/seo-crawler/SiteExplorer';
import MainDataView from '../components/seo-crawler/MainDataView';
import AuditSidebar from '../components/seo-crawler/AuditSidebar';
import StatusBar from '../components/seo-crawler/StatusBar';
import CrawlerModals from '../components/seo-crawler/CrawlerModals';

export default function SeoCrawlerWrapper() {
    return (
        <SeoCrawlerProvider>
            <SeoCrawlerLayout />
        </SeoCrawlerProvider>
    );
}

function SeoCrawlerLayout() {
    return (
        <div className="flex flex-col h-screen bg-[#070707] text-[#e0e0e0] font-sans overflow-hidden">
            <CrawlerHeader />

            <div className="flex-1 flex min-h-0 relative">
                <SiteExplorer />

                <MainDataView />

                <AuditSidebar />
            </div>

            <StatusBar />

            <CrawlerModals />
        </div>
    );
}
