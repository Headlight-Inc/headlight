import React from 'react';

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

export default function MetricTile({
    label, value, sub, tone = 'neutral', onClick, icon,
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    tone?: Tone;
    onClick?: () => void;
    icon?: React.ReactNode;
}) {
    const toneClass = {
        neutral: 'text-white',
        good:    'text-green-400',
        warn:    'text-orange-400',
        bad:     'text-red-400',
        info:    'text-blue-400',
    }[tone];

    const Comp = onClick ? 'button' : 'div';
    return (
        <Comp
            onClick={onClick}
            className={`w-full text-left bg-[#0a0a0a] border border-[#222] rounded-lg p-3 transition-colors ${onClick ? 'hover:border-[#333] hover:bg-[#111] cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-1.5 text-[10px] text-[#666] uppercase tracking-widest">
                {icon}
                {label}
            </div>
            <div className={`text-[22px] font-black mt-1 leading-tight ${toneClass}`}>{value}</div>
            {sub && <div className="text-[10px] text-[#777] mt-1">{sub}</div>}
        </Comp>
    );
}
