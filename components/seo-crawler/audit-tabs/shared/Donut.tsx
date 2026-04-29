import React from 'react';
import { toneBg, type Tone } from './formatters';

const PALETTE: Tone[] = ['info', 'good', 'warn', 'bad', 'info', 'mute'];

export function Donut({ slices, center }: {
    slices: Array<{ label: string; value: number }>;
    center?: React.ReactNode;
}) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    let acc = 0;
    const r = 28;
    const c = 2 * Math.PI * r;

    return (
        <div className="flex items-center gap-3">
            <svg width={72} height={72} viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
                {total > 0 && slices.map((s, i) => {
                    const frac = s.value / total;
                    const dasharray = `${frac * c} ${c}`;
                    const dashoffset = -acc * c;
                    acc += frac;
                    return (
                        <circle key={s.label} cx="36" cy="36" r={r} fill="none"
                            className={toneBg(PALETTE[i % PALETTE.length]).replace('bg-', 'stroke-')}
                            strokeWidth="10" strokeDasharray={dasharray} strokeDashoffset={dashoffset}
                            transform="rotate(-90 36 36)" />
                    );
                })}
                {center && (
                    <foreignObject x="0" y="0" width="72" height="72">
                        <div className="w-full h-full flex items-center justify-center text-white text-[12px] font-bold">{center}</div>
                    </foreignObject>
                )}
            </svg>
            <ul className="flex-1 min-w-0 space-y-1">
                {slices.slice(0, 6).map((s, i) => (
                    <li key={s.label} className="flex items-center gap-2 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneBg(PALETTE[i % PALETTE.length])}`} />
                        <span className="text-[#ccc] truncate flex-1">{s.label}</span>
                        <span className="text-[#888] font-mono tabular-nums">{s.value.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
