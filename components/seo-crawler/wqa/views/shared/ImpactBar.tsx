import React from 'react';

export default function ImpactBar({
    value, max, color = '#F5364E', height = 6,
}: { value: number; max: number; color?: string; height?: number }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="w-full rounded-full overflow-hidden bg-[#1a1a1a]" style={{ height }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}
