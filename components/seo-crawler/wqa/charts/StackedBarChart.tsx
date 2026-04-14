import React from 'react';

interface StackedRow {
  label: string;
  segments: Array<{ value: number; color: string; label: string }>;
}

interface Props {
  data: StackedRow[];
  legend?: Array<{ label: string; color: string }>;
}

export default function StackedBarChart({ data, legend }: Props) {
  return (
    <div className="space-y-2">
      {data.map((row) => {
        const total = row.segments.reduce((s, seg) => s + seg.value, 0);
        if (total === 0) return null;
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-[#aaa]">{row.label}</span>
              <span className="text-[10px] text-[#666]">{total}</span>
            </div>
            <div className="flex h-4 rounded overflow-hidden bg-[#111]">
              {row.segments.map((seg, i) => {
                if (seg.value === 0) return null;
                const pct = (seg.value / total) * 100;
                return (
                  <div
                    key={i}
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                    title={`${seg.label}: ${seg.value}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      {legend && (
        <div className="flex items-center gap-3 mt-1">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] text-[#666]">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
