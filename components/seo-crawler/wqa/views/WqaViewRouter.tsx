import React from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import WqaGridView    from './WqaGridView';
import WqaMapView     from './WqaMapView';
import WqaReportsView from './WqaReportsView';

export default function WqaViewRouter() {
    const { wqaState } = useSeoCrawler();
    switch (wqaState.viewMode) {
        case 'map':     return <WqaMapView />;
        case 'reports': return <WqaReportsView />;
        case 'grid':
        default:        return <WqaGridView />;
    }
}
