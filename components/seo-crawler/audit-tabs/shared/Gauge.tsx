import React from 'react';
import { toneText, type Tone } from './formatters';

export function Gauge({ value, label, tone = 'info', sub }: {
    value: number; // 0..100
    label?: string;
    sub?: React.ReactNode;
    tone?: Tone;
}) {
    const v = Math.max(0, Math.min(100, value));
    const r = 30;
    const c = Math.PI * r;
    const dash = (v / 100) * c;
    return (
        <div className="flex flex-col items-center">
            <svg width={88} height={56} viewBox="0 0 88 56">
                <path d="M 14 50 A 30 30 0 0 1 74 50" fill="none" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
                <path d="M 14 50 A 30 30 0 0 1 74 50" fill="none"
                    className={toneText(tone).replace('text-', 'stroke-')}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${dash} ${c}`} />
            </svg>
            <div className="-mt-3 text-[22px] font-bold text-white tabular-nums leading-none">{Math.round(v)}</div>
            {label && <div className="text-[10px] uppercase tracking-widest text-[#666] mt-1">{label}</div>}
            {sub && <div className="text-[10px] text-[#888] mt-0.5">{sub}</div>}
        </div>
    );
}
