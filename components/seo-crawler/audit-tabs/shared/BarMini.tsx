import React from 'react';
import { toneBg, type Tone } from './formatters';

export function BarMini({ value, max, label, count, tone = 'info' }: {
    value: number;
    max: number;
    label: string;
    count?: number;
    tone?: Tone;
}) {
    const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#ccc] truncate">{label}</span>
                    {typeof count === 'number' && (
                        <span className="text-[11px] font-mono text-[#888] tabular-nums">{count.toLocaleString()}</span>
                    )}
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className={`h-full ${toneBg(tone)}`} style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
}
