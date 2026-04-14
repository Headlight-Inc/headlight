import React from 'react';

interface WaterfallSegment {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  baseline: number;
  baselineLabel?: string;
  segments: WaterfallSegment[];
  resultLabel?: string;
  formatValue?: (v: number) => string;
}

export default function WaterfallChart({
  baseline,
  baselineLabel = 'Current',
  segments,
  resultLabel = 'After',
  formatValue = (v) => v.toLocaleString(),
}: Props) {
  const total = baseline + segments.reduce((s, seg) => s + seg.value, 0);
  const maxVal = Math.max(baseline, total, 1) * 1.15;
  const barH = 24;
  const gap = 6;
  const labelW = 96;
  const valueW = 80;
  const chartW = 230;
  const rows = 2 + segments.length;
  const svgH = rows * (barH + gap) + 6;

  const scale = (v: number) => (v / maxVal) * chartW;

  let cumulative = baseline;

  return (
    <svg
      viewBox={`0 0 ${labelW + chartW + valueW + 16} ${svgH}`}
      className="w-full"
      style={{ maxHeight: svgH }}
    >
      <text x={0} y={barH / 2 + 4} fill="#aaa" fontSize={10} fontWeight={600}>
        {baselineLabel}
      </text>
      <rect x={labelW} y={0} width={scale(baseline)} height={barH} rx={3} fill="#444" />
      <text x={labelW + scale(baseline) + 6} y={barH / 2 + 4} fill="#ccc" fontSize={10} fontWeight={600}>
        {formatValue(baseline)}
      </text>

      {segments.map((seg, i) => {
        const y = (i + 1) * (barH + gap);
        const startX = labelW + scale(cumulative);
        const w = scale(seg.value);
        cumulative += seg.value;

        return (
          <g key={seg.label}>
            <line x1={startX} y1={y - gap} x2={startX} y2={y + barH / 2} stroke="#333" strokeWidth={1} strokeDasharray="2,2" />
            <text x={0} y={y + barH / 2 + 4} fill="#888" fontSize={9}>{seg.label}</text>
            <rect x={startX} y={y} width={Math.max(w, 2)} height={barH} rx={3} fill={seg.color || '#22c55e'} />
            <text x={startX + w + 6} y={y + barH / 2 + 4} fill="#22c55e" fontSize={10} fontWeight={600}>
              +{formatValue(seg.value)}
            </text>
          </g>
        );
      })}

      {(() => {
        const y = (segments.length + 1) * (barH + gap);
        return (
          <>
            <text x={0} y={y + barH / 2 + 4} fill="#aaa" fontSize={10} fontWeight={600}>
              {resultLabel}
            </text>
            <rect x={labelW} y={y} width={scale(total)} height={barH} rx={3} fill="#F5364E" />
            <text x={labelW + scale(total) + 6} y={y + barH / 2 + 4} fill="#F5364E" fontSize={11} fontWeight={700}>
              {formatValue(total)}
            </text>
          </>
        );
      })()}
    </svg>
  );
}
