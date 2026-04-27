import React from 'react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';
import MainDataView from './MainDataView';
import AiDiscoverabilityView from './views/AiDiscoverabilityView';
import GeoSpatialView from './views/GeoSpatialView';
import CompetitorModeRouter from './views/competitor/CompetitorModeRouter';

export default function AuditViewRouter() {
    const { mode } = useSeoCrawler();

    switch (mode) {
        case 'competitors':
            return <CompetitorModeRouter />;
        case 'ai':
            return <AiDiscoverabilityView />;
        case 'local':
            return <GeoSpatialView />;
        default:
            return <MainDataView />;
    }
}
