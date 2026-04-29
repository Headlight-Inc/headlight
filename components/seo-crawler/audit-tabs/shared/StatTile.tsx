import React from 'react';
import { fmtDelta, toneText, type Tone } from './formatters';

export function StatTile({ label, value, sub, delta, tone = 'mute' }: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    delta?: number;
    tone?: Tone;
}) {
    return (
        <div className="bg-[#0a0a0a] border border-[#222] rounded p-2.5">
            <div className="text-[10px] uppercase tracking-widest text-[#666]">{label}</div>
            <div className="text-[20px] font-bold text-white mt-1 tabular-nums">{value}</div>
            {(sub || typeof delta === 'number') && (
                <div className="flex items-center gap-2 mt-1">
                    {sub && <span className="text-[10px] text-[#777]">{sub}</span>}
                    {typeof delta === 'number' && (
                        <span className={`text-[10px] font-mono tabular-nums ${toneText(tone)}`}>{fmtDelta(delta)}</span>
                    )}
                </div>
            )}
        </div>
    );
}
