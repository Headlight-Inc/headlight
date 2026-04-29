import React from 'react';
import { toneBg, type Tone } from './formatters';

export function StatusDot({ tone = 'mute' }: { tone?: Tone }) {
    return <span className={`inline-block w-1.5 h-1.5 rounded-full ${toneBg(tone)}`} />;
}
