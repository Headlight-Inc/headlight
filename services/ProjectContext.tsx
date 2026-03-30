import React, { createContext, useContext, useEffect, useState } from 'react';
import { IndustryType, ProjectRecord } from './app-types';
import { useAuth } from './AuthContext';

type Project = ProjectRecord;

interface ProjectContextType {
    projects: Project[];
    activeProject: Project | null;
    loading: boolean;
    switchProject: (projectId: string) => void;
    addProject: (name: string, url: string, industry: IndustryType) => Promise<Project | null>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
    deleteProject: (id: string) => Promise<boolean>;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, source } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const projectStorageKey = user ? `headlight:projects:${source}:${user.id}` : null;
    const activeProjectStorageKey = user ? `headlight:projects:${source}:${user.id}:active` : null;

    const persistLocalProjects = (nextProjects: Project[], nextActiveProject: Project | null) => {
        if (typeof window === 'undefined' || !projectStorageKey || !activeProjectStorageKey) return;
        window.localStorage.setItem(projectStorageKey, JSON.stringify(nextProjects));
        if (nextActiveProject) {
            window.localStorage.setItem(activeProjectStorageKey, nextActiveProject.id);
        } else {
            window.localStorage.removeItem(activeProjectStorageKey);
        }
    };

    const fetchProjects = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const saved = typeof window !== 'undefined' && projectStorageKey
                ? JSON.parse(window.localStorage.getItem(projectStorageKey) || '[]')
                : [];
            const savedActiveId = typeof window !== 'undefined' && activeProjectStorageKey
                ? window.localStorage.getItem(activeProjectStorageKey)
                : null;
            setProjects(saved || []);
            if (saved?.length > 0) {
                setActiveProject(saved.find((p: Project) => p.id === savedActiveId) || saved[0]);
            } else {
                setActiveProject(null);
            }
        } catch (err) {
            console.error('Error fetching local projects:', err);
            setProjects([]);
            setActiveProject(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
        } else {
            setProjects([]);
            setActiveProject(null);
            setLoading(false);
        }
    }, [user]);

    const switchProject = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            setActiveProject(project);
            if (typeof window !== 'undefined' && activeProjectStorageKey) {
                window.localStorage.setItem(activeProjectStorageKey, project.id);
            }
        }
    };

    const addProject = async (name: string, url: string, industry: IndustryType) => {
        if (!user) return null;
        const newProject = {
            id: `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            user_id: user.id,
            name,
            url,
            industry,
            created_at: new Date().toISOString()
        } as Project;
        const nextProjects = [newProject, ...projects];
        setProjects(nextProjects);
        setActiveProject(newProject);
        persistLocalProjects(nextProjects, newProject);
        return newProject;
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        const nextProjects = projects.map((p) => p.id === id ? { ...p, ...updates } : p);
        const nextActiveProject = activeProject && activeProject.id === id
            ? { ...activeProject, ...updates }
            : activeProject;
        setProjects(nextProjects);
        if (nextActiveProject) setActiveProject(nextActiveProject);
        persistLocalProjects(nextProjects, nextActiveProject);
        return true;
    };

    const deleteProject = async (id: string) => {
        const nextProjects = projects.filter((p) => p.id !== id);
        const nextActiveProject = activeProject && activeProject.id === id
            ? (nextProjects[0] || null)
            : activeProject;
        setProjects(nextProjects);
        setActiveProject(nextActiveProject);
        persistLocalProjects(nextProjects, nextActiveProject);
        return true;
    };

    return (
        <ProjectContext.Provider value={{ projects, activeProject, loading, switchProject, addProject, updateProject, deleteProject, refreshProjects: fetchProjects }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

export const useOptionalProject = () => useContext(ProjectContext);
