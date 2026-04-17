import React from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import WqaGridView      from './WqaGridView';
import WqaOverviewView  from './WqaOverviewView';
import WqaActionsView   from './WqaActionsView';
import WqaStructureView from './WqaStructureView';

export default function WqaViewRouter() {
    const { wqaState } = useSeoCrawler();

    switch (wqaState.viewMode) {
        case 'overview':  return <WqaOverviewView />;
        case 'actions':   return <WqaActionsView />;
        case 'structure': return <WqaStructureView />;
        case 'grid':
        default:          return <WqaGridView />;
    }
}
