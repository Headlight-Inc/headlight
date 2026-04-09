import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SeoCrawlerProvider } from '../contexts/SeoCrawlerContext';
import CrawlerHeader from '../components/seo-crawler/CrawlerHeader';
import SiteExplorer from '../components/seo-crawler/SiteExplorer';
import MainDataView from '../components/seo-crawler/MainDataView';
import AuditSidebar from '../components/seo-crawler/AuditSidebar';
import StatusBar from '../components/seo-crawler/StatusBar';
import CrawlerModals from '../components/seo-crawler/CrawlerModals';
import { CollaborationOverlay } from '../components/seo-crawler/CollaborationOverlay';
import CrawlerEmptyState from '../components/seo-crawler/CrawlerEmptyState';
import CrawlProgressOverlay from '../components/seo-crawler/CrawlProgressOverlay';
import ComparisonView from '../components/seo-crawler/ComparisonView';
import ExportDialog from '../components/seo-crawler/ExportDialog';
import MobileBottomSheet from '../components/seo-crawler/MobileBottomSheet';
import { useSeoCrawler } from '../contexts/SeoCrawlerContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

class SeoCrawlerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            errorMessage: error?.message || 'Unknown crawler error'
        };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[SeoCrawler] Runtime error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen bg-[#070707] text-[#e0e0e0] flex items-center justify-center p-6">
                    <div className="max-w-xl w-full rounded-lg border border-[#2a2a2a] bg-[#111] p-5">
                        <div className="text-[11px] uppercase tracking-widest text-[#888] mb-2">Crawler Error</div>
                        <div className="text-[16px] text-white font-semibold mb-2">The crawler UI hit a runtime error.</div>
                        <div className="text-[12px] text-[#aaa] leading-relaxed">
                            {this.state.errorMessage}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function SeoCrawlerWrapper() {
    return (
        <SeoCrawlerErrorBoundary>
            <SeoCrawlerProvider>
                <SeoCrawlerLayout />
            </SeoCrawlerProvider>
        </SeoCrawlerErrorBoundary>
    );
}

function SeoCrawlerLayout() {
    const { isMobile, isTablet } = useBreakpoint();
    const [showMobileExplorer, setShowMobileExplorer] = React.useState(false);
    const [showMobileAudit, setShowMobileAudit] = React.useState(false);
    const {
        showCollabOverlay,
        setShowCollabOverlay,
        pages,
        isCrawling,
        crawlHistory,
        showComparisonView,
        setShowComparisonView,
        showExportDialog,
        setShowExportDialog
    } = useSeoCrawler();

    const shouldShowEmptyState = pages.length === 0 && !isCrawling && crawlHistory.length === 0;
    const isCompactLayout = isMobile || isTablet;

    return (
        <div className="flex flex-col h-screen bg-[#070707] text-[#e0e0e0] font-sans overflow-hidden">
            <CrawlerHeader />

            <div className="flex-1 flex min-h-0 relative">
                {shouldShowEmptyState ? (
                    <CrawlerEmptyState />
                ) : (
                    <>
                        {!isCompactLayout && <SiteExplorer />}
                        <MainDataView />
                        {!isCompactLayout && <AuditSidebar />}
                    </>
                )}

                <CollaborationOverlay 
                    isOpen={showCollabOverlay} 
                    onClose={() => setShowCollabOverlay(false)} 
                />
            </div>

            <StatusBar />

            <CrawlerModals />
            <CrawlProgressOverlay />
            {showComparisonView && <ComparisonView onClose={() => setShowComparisonView(false)} />}
            {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}

            {!shouldShowEmptyState && isCompactLayout && (
                <>
                    <div className="pointer-events-none fixed bottom-16 right-4 z-[60] flex flex-col gap-3">
                        <button
                            onClick={() => setShowMobileExplorer(true)}
                            className="pointer-events-auto rounded-full border border-[#2f2f35] bg-[#111] px-4 py-3 text-[12px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        >
                            Filters
                        </button>
                        <button
                            onClick={() => setShowMobileAudit(true)}
                            className="pointer-events-auto rounded-full border border-[#2f2f35] bg-[#111] px-4 py-3 text-[12px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        >
                            Audit
                        </button>
                    </div>

                    <MobileBottomSheet isOpen={showMobileExplorer} onClose={() => setShowMobileExplorer(false)} title="Site Explorer" defaultHeight={82}>
                        <SiteExplorer embedded />
                    </MobileBottomSheet>

                    <MobileBottomSheet isOpen={showMobileAudit} onClose={() => setShowMobileAudit(false)} title="Audit Panel" defaultHeight={82}>
                        <AuditSidebar embedded />
                    </MobileBottomSheet>
                </>
            )}
        </div>
    );
}
