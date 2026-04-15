import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface BucketData {
  label: string;
  count: number;
}

interface Props {
  data: BucketData[];
}

const BUCKET_COLORS: Record<string, string> = {
  '1-3': '#22c55e',
  '4-10': '#3b82f6',
  '11-20': '#f59e0b',
  '21-50': '#f97316',
  '50+': '#ef4444',
  None: '#555',
};

export default function PositionHistogram({ data }: Props) {
  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 2, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 6, fontSize: 11 }}
            formatter={(v: number) => [v.toLocaleString(), 'Pages']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={BUCKET_COLORS[entry.label] || '#666'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
