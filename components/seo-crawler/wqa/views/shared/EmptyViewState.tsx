import React from 'react';

export default function EmptyViewState({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex-1 flex items-center justify-center bg-[#070707]">
            <div className="max-w-md text-center px-6">
                <div className="text-[14px] text-white font-semibold mb-2">{title}</div>
                <div className="text-[12px] text-[#666]">{subtitle}</div>
            </div>
        </div>
    );
}
