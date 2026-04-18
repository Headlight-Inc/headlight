import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

export default function HealthSparkline({ data, height = 36, color = '#F5364E' }: {
    data: Array<{ t: string; v: number }>;
    height?: number;
    color?: string;
}) {
    if (!data?.length) return null;
    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                    <YAxis domain={[0, 100]} hide />
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
