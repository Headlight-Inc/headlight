import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';
import { AppHeader } from '../components/layout/AppHeader';

export const AppShell: React.FC = () => {
    const { workspace, business, project } = useParams();
    const [isCollapsed, setIsCollapsed] = useState(false);

    let view: 'workspace' | 'business' | 'project' | 'agency' = 'workspace';
    if (project) {
        view = 'project';
    } else if (business) {
        view = 'business';
    }

    return (
        <div className="flex h-screen bg-[#050505] font-sans overflow-hidden text-gray-200">
            <AppSidebar view={view} isCollapsed={isCollapsed} />
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppShell;
