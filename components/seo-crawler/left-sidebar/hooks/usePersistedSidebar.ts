import { useEffect } from 'react';
import { useSeoCrawler } from '../../../../contexts/SeoCrawlerContext';
import { saveSidebarState, loadSidebarState } from '../../../../services/SidebarPersistence';

export function usePersistedSidebar() {
	const { sidebarState, setSidebarState } = useSeoCrawler();
	useEffect(() => { setSidebarState(prev => ({ ...prev, ...loadSidebarState() })); }, []);
	useEffect(() => { saveSidebarState(sidebarState); }, [sidebarState.collapsed, sidebarState.collapsedSections]);
}
