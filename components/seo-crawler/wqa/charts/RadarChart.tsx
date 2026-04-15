import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RadarPoint {
  axis: string;
  value: number;
}

interface Props {
  data: RadarPoint[];
  size?: number;
}

export default function RadarChart({ data, size = 220 }: Props) {
  const height = Math.max(180, size);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="#222" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#888', fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#F5364E"
            fill="#F5364E"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: '#F5364E' }}
          />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#aaa' }}
            formatter={(value) => [String(value), 'Score']}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
