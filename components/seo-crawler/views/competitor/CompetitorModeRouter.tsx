import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import CompetitorToolbar from './CompetitorToolbar';
import CompetitorMatrixGrid from './CompetitorMatrixGrid';
import CompetitorChartsView from './CompetitorChartsView';
import CompetitorBattlefieldView from './CompetitorBattlefieldView';
import CompetitorTimelineView from './CompetitorTimelineView';
import CompetitorBriefView from './CompetitorBriefView';
import CompetitorEmptyState from './CompetitorEmptyState';

export default function CompetitorModeRouter() {
  const { competitiveViewMode, competitiveState, pages } = useSeoCrawler();
  const { ownProfile, competitorProfiles } = competitiveState;

  // If no profiles at all and no crawl data, show empty state
  if (!ownProfile && competitorProfiles.size === 0 && pages.length === 0) {
    return <CompetitorEmptyState />;
  }

  // If we have pages but no own profile yet, show building state
  if (!ownProfile && pages.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5364E] mx-auto mb-4" />
          <p className="text-[12px] text-[#888]">Building your competitive profile from crawl data...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (competitiveViewMode) {
      case 'matrix':      return <CompetitorMatrixGrid />;
      case 'charts':      return <CompetitorChartsView />;
      case 'battlefield': return <CompetitorBattlefieldView />;
      case 'timeline':    return <CompetitorTimelineView />;
      case 'brief':       return <CompetitorBriefView />;
      default:            return <CompetitorMatrixGrid />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
      <CompetitorToolbar />
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}
