import React from 'react';

export function EmptyHint({ icon, title, sub, action }: {
    icon?: React.ReactNode;
    title: string;
    sub?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="bg-[#0a0a0a] border border-dashed border-[#222] rounded p-4 text-center">
            {icon && <div className="text-[#444] mb-1.5">{icon}</div>}
            <div className="text-[12px] text-[#ccc] font-medium">{title}</div>
            {sub && <div className="text-[11px] text-[#666] mt-1 leading-snug">{sub}</div>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
