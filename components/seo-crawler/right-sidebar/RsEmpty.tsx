import React from 'react'

export function RsEmpty({ title, body, pulse = false }: { title: string; body: string; pulse?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-10">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-center mb-4">
                <div className={`w-2 h-2 rounded-full bg-[#F5364E] ${pulse ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-1">{title}</h3>
            <p className="text-[11px] text-[#666] max-w-[220px] leading-relaxed">{body}</p>
        </div>
    )
}
