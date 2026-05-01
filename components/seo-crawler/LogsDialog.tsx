import React, { useRef, useEffect } from 'react';
import { X, Search, Activity, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useSeoCrawler } from '../../contexts/SeoCrawlerContext';

interface LogsDialogProps {
    onClose: () => void;
}

export default function LogsDialog({ onClose }: LogsDialogProps) {
    const { logs, logSearch, setLogSearch, logTypeFilter, setLogTypeFilter } = useSeoCrawler();
    const logsEndRef = useRef<HTMLDivElement>(null);

    const filteredLogs = logs.filter((log) => {
        if (logTypeFilter !== 'all' && log.type !== logTypeFilter) return false;
        if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
        return true;
    });

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredLogs.length]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle size={16} className="text-red-400" />;
            case 'warn': return <AlertTriangle size={16} className="text-amber-400" />;
            case 'success': return <CheckCircle2 size={16} className="text-emerald-400" />;
            default: return <Info size={16} className="text-blue-400" />;
        }
    };

    const getBackgroundClass = (type: string) => {
        switch (type) {
            case 'error': return 'bg-red-500/10 border-red-500/20';
            case 'warn': return 'bg-amber-500/10 border-amber-500/20';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
            default: return 'bg-[#18181c] border-[#26262b]';
        }
    };

    const filters = [
        { id: 'all', label: 'All Activity' },
        { id: 'info', label: 'Updates' },
        { id: 'success', label: 'Success' },
        { id: 'warn', label: 'Warnings' },
        { id: 'error', label: 'Errors' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
            <div className="relative flex h-full max-h-[700px] w-full max-w-[600px] flex-col rounded-3xl border border-[#26262b] bg-[#0d0d10] shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e1e24] shrink-0 bg-[#111114]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-semibold text-white tracking-tight">Scan Activity</h2>
                            <p className="text-[13px] text-[#777]">Live timeline of events and system updates</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181c] border border-[#26262b] text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-4 px-6 py-4 border-b border-[#1e1e24] shrink-0 bg-[#0d0d10]">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                        <input 
                            type="text" 
                            placeholder="Search activity..." 
                            value={logSearch} 
                            onChange={(e) => setLogSearch(e.target.value)}
                            className="w-full rounded-2xl border border-[#26262b] bg-[#141418] pl-10 pr-4 py-2.5 text-[14px] text-white placeholder:text-[#666] focus:border-[#444] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setLogTypeFilter(filter.id as any)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                                    logTypeFilter === filter.id 
                                        ? 'bg-white text-black shadow-md' 
                                        : 'bg-[#18181c] text-[#888] border border-[#26262b] hover:text-white hover:bg-[#222]'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#0a0a0c]">
                    {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                            <Activity size={32} className="text-[#555]" />
                            <p className="text-[14px] text-[#888]">No activity found matching your filters.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log, index) => (
                            <div 
                                key={index} 
                                className={`flex items-start gap-4 p-4 rounded-2xl border ${getBackgroundClass(log.type)} transition-colors`}
                            >
                                <div className="shrink-0 mt-0.5 bg-[#0a0a0c] rounded-full p-1 shadow-sm">
                                    {getIcon(log.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[14px] leading-snug text-gray-200 break-words">
                                            {log.message}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-medium text-[#666]">
                                                {new Date(log.timestamp).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit', 
                                                    second: '2-digit'
                                                })}
                                            </span>
                                            {log.meta?.url && (
                                                <span className="text-[11px] text-blue-400/80 truncate max-w-[200px]" title={log.meta.url}>
                                                    {log.meta.url.replace(/^https?:\/\//, '')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}
