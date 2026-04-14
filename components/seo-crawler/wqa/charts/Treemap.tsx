import React, { useMemo } from 'react';

interface TreemapItem {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

interface Props {
  data: TreemapItem[];
  height?: number;
  onClick?: (label: string) => void;
}

function layoutTreemap(
  items: TreemapItem[],
  width: number,
  height: number
): Array<TreemapItem & { x: number; y: number; w: number; h: number }> {
  const total = items.reduce((s, d) => s + d.value, 0);
  if (total === 0 || items.length === 0) return [];

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const result: Array<TreemapItem & { x: number; y: number; w: number; h: number }> = [];

  let x = 0;
  let y = 0;
  let remainingW = width;
  let remainingH = height;
  let remainingTotal = total;
  let isRow = remainingW >= remainingH;

  for (const item of sorted) {
    const ratio = item.value / remainingTotal;
    let w: number;
    let h: number;

    if (isRow) {
      w = remainingW * ratio;
      h = remainingH;
      result.push({ ...item, x, y, w, h });
      x += w;
      remainingW -= w;
    } else {
      w = remainingW;
      h = remainingH * ratio;
      result.push({ ...item, x, y, w, h });
      y += h;
      remainingH -= h;
    }

    remainingTotal -= item.value;
    if (remainingTotal <= 0) break;

    if (result.length % 3 === 0) isRow = remainingW >= remainingH;
  }

  return result;
}

export default function Treemap({ data, height = 200, onClick }: Props) {
  const width = 320;

  const cells = useMemo(
    () => layoutTreemap(data.filter((d) => d.value > 0), width, height),
    [data, height]
  );

  if (cells.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded" style={{ maxHeight: height }}>
      {cells.map((cell) => {
        const showLabel = cell.w > 40 && cell.h > 28;
        const showSublabel = cell.w > 50 && cell.h > 40 && cell.sublabel;
        return (
          <g
            key={cell.label}
            className={onClick ? 'cursor-pointer' : ''}
            onClick={() => onClick?.(cell.label)}
          >
            <rect
              x={cell.x + 1}
              y={cell.y + 1}
              width={Math.max(cell.w - 2, 0)}
              height={Math.max(cell.h - 2, 0)}
              rx={3}
              fill={cell.color}
              opacity={0.85}
            />
            <rect
              x={cell.x + 1}
              y={cell.y + 1}
              width={Math.max(cell.w - 2, 0)}
              height={Math.max(cell.h - 2, 0)}
              rx={3}
              fill="transparent"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
            />
            {showLabel && (
              <text
                x={cell.x + cell.w / 2}
                y={cell.y + cell.h / 2 + (showSublabel ? -5 : 2)}
                textAnchor="middle"
                fill="white"
                fontSize={cell.w > 80 ? 11 : 9}
                fontWeight={700}
              >
                {cell.label}
              </text>
            )}
            {showSublabel && (
              <text
                x={cell.x + cell.w / 2}
                y={cell.y + cell.h / 2 + 10}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize={9}
              >
                {cell.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
