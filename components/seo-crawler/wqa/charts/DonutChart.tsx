import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Segment[];
  size?: number;
}

export default function DonutChart({ data, size = 160 }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-3" style={{ minHeight: size }}>
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={Math.max(24, Math.floor(size * 0.2))}
              outerRadius={Math.max(36, Math.floor(size * 0.31))}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={`${entry.label}-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 6, fontSize: 11 }}
              formatter={(value: number) => [
                `${value.toLocaleString()} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                '',
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <div className="text-[18px] leading-none font-black text-white">{total.toLocaleString()}</div>
        <div className="text-[10px] text-[#666] mt-0.5">pages</div>
      </div>
    </div>
  );
}
