import React from 'react'

export function Card({ title, action, children, padding = 'p-3' }: {
    title?: string
    action?: React.ReactNode
    children: React.ReactNode
    padding?: string
}) {
    return (
        <section className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-md mb-2.5 overflow-hidden">
            {(title || action) && (
                <header className="flex items-center justify-between px-3 h-7 border-b border-[#1c1c1c]">
                    {title && (
                        <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-[0.14em]">
                            {title}
                        </h4>
                    )}
                    {action && <div className="text-[10px] text-[#666]">{action}</div>}
                </header>
            )}
            <div className={padding}>{children}</div>
        </section>
    )
}
