import React from 'react';

export function Card({ title, action, children, dense = false, noPadding = false }: {
    title?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    dense?: boolean;
    noPadding?: boolean;
}) {
    return (
        <section className="bg-[#111] border border-[#222] rounded overflow-hidden">
            {title && (
                <header className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#222]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{title}</h3>
                    {action}
                </header>
            )}
            <div className={noPadding ? '' : dense ? 'p-1.5' : 'p-2.5'}>{children}</div>
        </section>
    );
}
