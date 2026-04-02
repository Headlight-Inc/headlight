import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WorkspaceRecord } from '../services/app-types';

interface WorkspaceContextType {
    workspaces: WorkspaceRecord[];
    activeWorkspace: WorkspaceRecord | null;
    setActiveWorkspace: (workspace: WorkspaceRecord | null) => void;
    setWorkspaces: (workspaces: WorkspaceRecord[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Basic mock initialization for now
    const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([{
        id: 'workspace_1',
        name: 'My Workspace',
        user_id: 'user_1'
    }]);
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceRecord | null>(workspaces[0]);

    return (
        <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, setWorkspaces }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
