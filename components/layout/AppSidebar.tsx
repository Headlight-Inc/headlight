import React from 'react';
import {
    LayoutDashboard, Search, Sparkles, Globe, Target, Share2, Activity,
    Lightbulb, Briefcase, BellRing, Settings, Users, ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface AppSidebarProps {
    view: 'workspace' | 'business' | 'project' | 'agency';
    isCollapsed: boolean;
}

const SidebarItem = ({ icon, label, onClick, active, collapsed }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${active
            ? 'bg-white/10 text-white shadow-glow-sm border border-white/5'
            : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
            } ${collapsed ? 'justify-center px-2' : ''}`}
        title={collapsed ? label : undefined}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110 text-brand-red' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        {!collapsed && (
            <span className={`text-sm font-medium ${active ? 'text-white' : ''} truncate`}>
                {label}
            </span>
        )}
    </button>
);

export const AppSidebar: React.FC<AppSidebarProps> = ({ view, isCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { workspace, business, project } = useParams();

    const isActive = (path: string) => location.pathname.endsWith(path);

    const renderWorkspaceItems = () => (
        <>
            <div className="px-4 mb-1"><span className="text-[10px] font-bold text-gray-600 uppercase">Workspace</span></div>
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={isActive(workspace || '')} onClick={() => navigate(`/app/${workspace}`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Briefcase size={18} />} label="Businesses" active={isActive('businesses')} onClick={() => navigate(`/app/${workspace}/businesses`)} collapsed={isCollapsed} />
            <div className="my-4 border-t border-white/5"></div>
            <SidebarItem icon={<Users size={18} />} label="Account" active={isActive('account')} onClick={() => navigate(`/app/account`)} collapsed={isCollapsed} />
        </>
    );

    const renderBusinessItems = () => (
        <>
            <SidebarItem icon={<ArrowLeft size={18} />} label="Back to Workspace" onClick={() => navigate(`/app/${workspace}`)} collapsed={isCollapsed} />
            <div className="my-4 border-t border-white/5"></div>
            <div className="px-4 mb-1"><span className="text-[10px] font-bold text-gray-600 uppercase">Business</span></div>
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={isActive(business || '')} onClick={() => navigate(`/app/${workspace}/${business}`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Briefcase size={18} />} label="Projects" active={isActive('projects')} onClick={() => navigate(`/app/${workspace}/${business}/projects`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Settings size={18} />} label="Settings" active={isActive('settings')} onClick={() => navigate(`/app/${workspace}/${business}/settings`)} collapsed={isCollapsed} />
        </>
    );

    const renderProjectItems = () => (
        <>
            <SidebarItem icon={<ArrowLeft size={18} />} label="Back to Business" onClick={() => navigate(`/app/${workspace}/${business}`)} collapsed={isCollapsed} />
            <div className="my-4 border-t border-white/5"></div>
            <div className="px-4 mb-1"><span className="text-[10px] font-bold text-gray-600 uppercase">Analyze</span></div>
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={isActive(project || '')} onClick={() => navigate(`/app/${workspace}/${business}/${project}`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Activity size={18} />} label="Site Audit" active={isActive('audit')} onClick={() => navigate(`/app/${workspace}/${business}/${project}/audit`)} collapsed={isCollapsed} />
            <div className="px-4 mb-1 mt-4"><span className="text-[10px] font-bold text-gray-600 uppercase">Research</span></div>
            <SidebarItem icon={<Target size={18} />} label="Rankings" active={isActive('rankings')} onClick={() => navigate(`/app/${workspace}/${business}/${project}/rankings`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Search size={18} />} label="Keywords" active={isActive('keywords')} onClick={() => navigate(`/app/${workspace}/${business}/${project}/keywords`)} collapsed={isCollapsed} />
            <SidebarItem icon={<Globe size={18} />} label="Competitors" active={isActive('competitors')} onClick={() => navigate(`/app/${workspace}/${business}/${project}/competitors`)} collapsed={isCollapsed} />
        </>
    );

    return (
        <aside className={`${isCollapsed ? 'w-[80px]' : 'w-[260px]'} relative shrink-0 hidden lg:flex flex-col border-r border-white/[0.08] bg-[#0A0A0A] z-40 transition-all duration-300 ease-in-out`}>
            <div className={`h-[76px] flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-white/[0.08]`}>
                <span className="text-brand-red font-bold text-xl uppercase tracking-widest font-heading">{isCollapsed ? 'HL' : 'Headlight'}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 py-4 scrollbar-hide">
                {view === 'workspace' && renderWorkspaceItems()}
                {view === 'business' && renderBusinessItems()}
                {view === 'project' && renderProjectItems()}
                {view === 'agency' && renderWorkspaceItems() /* fallback for now */}
            </div>
        </aside>
    );
};
