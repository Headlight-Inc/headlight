import React from 'react';
import { toneText, type Tone } from './formatters';

export function Sparkline({ data, tone = 'info', width = 88, height = 22 }: {
    data: number[]; tone?: Tone; width?: number; height?: number;
}) {
    if (!data.length) return <div className="text-[10px] text-[#555]">no trend</div>;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = data.length > 1 ? width / (data.length - 1) : 0;
    const pts = data.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / span) * height;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline points={pts} fill="none" strokeWidth="1.5"
                className={toneText(tone).replace('text-', 'stroke-')} />
        </svg>
    );
}
