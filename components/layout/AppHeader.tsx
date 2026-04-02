import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useProject } from '../../services/ProjectContext';
import { ChevronDown, Bot, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const AppHeader: React.FC = () => {
    const { workspaces, activeWorkspace } = useWorkspace();
    const { businesses, activeBusiness } = useBusiness();
    const { projects, activeProject } = useProject();
    const navigate = useNavigate();
    const { workspace, business, project } = useParams();

    return (
        <header className="h-[76px] border-b border-white/[0.08] flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Workspace Selector */}
                <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                        {activeWorkspace?.name || workspace || 'Select Workspace'}
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                        {workspaces.map(w => (
                            <button key={w.id} onClick={() => navigate(`/app/${w.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                                {w.name}
                            </button>
                        ))}
                    </div>
                </div>

                {(business || activeBusiness) && (
                    <>
                        <span className="text-gray-600">/</span>
                        {/* Business Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                                {activeBusiness?.name || business || 'Select Business'}
                                <ChevronDown size={14} className="text-gray-500" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                                {businesses.map(b => (
                                    <button key={b.id} onClick={() => navigate(`/app/${workspace}/${b.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {(project || activeProject) && (
                    <>
                        <span className="text-gray-600">/</span>
                        {/* Project Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-bold text-gray-200 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                                {activeProject?.name || project || 'Select Project'}
                                <ChevronDown size={14} className="text-gray-500" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                                {projects.map(p => (
                                    <button key={p.id} onClick={() => navigate(`/app/${workspace}/${business}/${p.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl gap-3 text-sm text-gray-400 w-72 hover:border-white/20 transition-colors cursor-text focus-within:border-brand-red/50 focus-within:bg-black/20">
                    <Search size={14} />
                    <span className="text-xs">Search...</span>
                </div>
                <button className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-colors text-brand-red shadow-glow-sm">
                    <Bot size={18} />
                </button>
            </div>
        </header>
    );
};
