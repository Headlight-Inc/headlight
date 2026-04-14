import React from 'react';

interface LegacyHeatCell { x: string; y: string; value: number; }
interface StatusHeatCell {
  row: string;
  col: string;
  status: 'growing' | 'flat' | 'declining';
}

type Props =
  | { data: LegacyHeatCell[]; rows?: never; cols?: never }
  | { data: StatusHeatCell[]; rows: string[]; cols: string[] };

const STATUS_COLORS: Record<string, string> = {
  growing: '#22c55e',
  flat: '#f59e0b',
  declining: '#ef4444',
};

export default function HeatmapGrid({ data }: Props) {
    if (!data.length) return null;

    const isStatusData = 'status' in data[0];

    if (isStatusData) {
        const statusData = data as StatusHeatCell[];
        const rows = Array.from(new Set(statusData.map((d) => d.row)));
        const cols = Array.from(new Set(statusData.map((d) => d.col)));
        const getCell = (row: string, col: string) => statusData.find((d) => d.row === row && d.col === col);

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr>
                            <th className="text-left text-[#666] font-normal pb-1 pr-2" />
                            {cols.map((col) => (
                                <th key={col} className="text-center text-[#666] font-normal pb-1 px-1">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row}>
                                <td className="text-[#aaa] pr-2 py-0.5 whitespace-nowrap">{row}</td>
                                {cols.map((col) => {
                                    const cell = getCell(row, col);
                                    return (
                                        <td key={col} className="text-center px-1 py-0.5">
                                            {cell ? (
                                                <div
                                                    className="w-5 h-5 rounded-sm mx-auto"
                                                    style={{ backgroundColor: STATUS_COLORS[cell.status] || '#333' }}
                                                    title={`${row} / ${col}: ${cell.status}`}
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-sm mx-auto bg-[#1a1a1a]" />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
                        <span className="text-[9px] text-[#666]">Growing</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                        <span className="text-[9px] text-[#666]">Flat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                        <span className="text-[9px] text-[#666]">Declining</span>
                    </div>
                </div>
            </div>
        );
    }

    const legacyData = data as LegacyHeatCell[];
    const xs = Array.from(new Set(legacyData.map((d) => d.x)));
    const ys = Array.from(new Set(legacyData.map((d) => d.y)));
    const max = Math.max(...legacyData.map((d) => d.value), 1);

    const getVal = (x: string, y: string) => legacyData.find((d) => d.x === x && d.y === y)?.value || 0;

    return (
        <div className="space-y-1">
            {ys.map((y) => (
                <div key={y} className="flex items-center gap-1">
                    <span className="w-16 text-[9px] text-[#666] truncate">{y}</span>
                    <div className="flex gap-1">
                        {xs.map((x) => {
                            const value = getVal(x, y);
                            const alpha = value / max;
                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: `rgba(59,130,246,${Math.max(0.08, alpha)})` }}
                                    title={`${x} / ${y}: ${value}`}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
