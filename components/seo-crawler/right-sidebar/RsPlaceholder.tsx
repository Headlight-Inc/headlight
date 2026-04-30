import React from 'react';

export function RsPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0a0a0a] border-l border-[#222]">
            <div className="w-12 h-12 mb-6 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#F5364E] animate-pulse" />
            </div>
            
            <h2 className="text-[14px] font-bold text-white mb-2 uppercase tracking-[0.2em]">
                Sidebar Under Construction
            </h2>
            
            <p className="text-[12px] text-[#666] max-w-[200px] leading-relaxed">
                We're rebuilding the sidebar experience for this mode.
            </p>
        </div>
    );
}
