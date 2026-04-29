import React from 'react';
import type { Tone } from './formatters';
import { toneBg, toneText } from './formatters';

export function SourceChip({ label, tone = 'info' }: { label: string; tone?: Tone }) {
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${toneText(tone)}`}>
            <span className={`w-1 h-1 rounded-full ${toneBg(tone)}`} />
            {label}
        </span>
    );
}
