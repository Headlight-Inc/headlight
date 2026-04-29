import React from 'react';
import { toneBg, type Tone } from './formatters';

export function StackedBar({ segments, height = 6 }: {
    segments: Array<{ label: string; value: number; tone: Tone }>;
    height?: number;
}) {
    const total = segments.reduce((s, x) => s + x.value, 0);
    if (total === 0) {
        return <div className="text-[10px] text-[#555]">no data</div>;
    }
    return (
        <div>
            <div className="flex items-center w-full overflow-hidden rounded" style={{ height }}>
                {segments.map((seg, i) => (
                    <div
                        key={`${seg.label}-${i}`}
                        className={`${toneBg(seg.tone)} h-full`}
                        style={{ width: `${(seg.value / total) * 100}%` }}
                        title={`${seg.label}: ${seg.value.toLocaleString()}`}
                    />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                {segments.map((seg) => (
                    <span key={seg.label} className="flex items-center gap-1 text-[10px] text-[#888]">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneBg(seg.tone)}`} />
                        <span className="text-[#aaa]">{seg.label}</span>
                        <span className="text-[#555] font-mono tabular-nums">{seg.value.toLocaleString()}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
