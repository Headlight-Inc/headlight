import React, { useMemo } from "react";
import SunburstChart from "../../charts/SunburstChart";
import { formatCat } from "../../wqaUtils";

interface Props {
	pages: any[];
}

const PALETTE = [
	"#F5364E",
	"#3b82f6",
	"#22c55e",
	"#f59e0b",
	"#a855f7",
	"#06b6d4",
	"#ec4899",
	"#84cc16",
	"#eab308",
	"#64748b",
];

export default function MapClusterMode({ pages }: Props) {
	const { segments, rows } = useMemo(() => {
		const buckets: Record<
			string,
			{ count: number; impressions: number; clicks: number; sessions: number }
		> = {};
		for (const p of pages) {
			const cat = String(p.pageCategory || "other");
			if (!buckets[cat])
				buckets[cat] = { count: 0, impressions: 0, clicks: 0, sessions: 0 };
			buckets[cat].count++;
			buckets[cat].impressions += Number(p.gscImpressions || 0);
			buckets[cat].clicks += Number(p.gscClicks || 0);
			buckets[cat].sessions += Number(p.ga4Sessions || 0);
		}
		const entries = Object.entries(buckets).sort(
			(a, b) => b[1].count - a[1].count,
		);
		return {
			segments: entries.map(([label, v], i) => ({
				label: formatCat(label),
				value: v.count,
				color: PALETTE[i % PALETTE.length],
			})),
			rows: entries.map(([label, v], i) => ({
				label: formatCat(label),
				...v,
				color: PALETTE[i % PALETTE.length],
			})),
		};
	}, [pages]);

	const totalPages = rows.reduce((s, r) => s + r.count, 0) || 1;

	return (
		<div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0">
			<div className="flex items-center justify-center border-r border-[#1a1a1a] p-6">
				<SunburstChart data={segments} size={300} />
			</div>
			<div className="overflow-auto custom-scrollbar p-6">
				<table className="w-full text-[12px]">
					<thead className="text-[10px] uppercase tracking-widest text-[#555]">
						<tr className="border-b border-[#1a1a1a]">
							<th className="text-left py-2">Category</th>
							<th className="text-right py-2 w-[80px]">Pages</th>
							<th className="text-right py-2 w-[80px]">Share</th>
							<th className="text-right py-2 w-[100px]">Impr.</th>
							<th className="text-right py-2 w-[80px]">Clicks</th>
							<th className="text-right py-2 w-[80px]">Sessions</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr
								key={r.label}
								className="border-b border-[#121212] hover:bg-[#0d0d0d]"
							>
								<td className="py-2">
									<span className="inline-flex items-center gap-2">
										<span
											className="w-2 h-2 rounded-full"
											style={{ background: r.color }}
										/>
										<span className="text-white">{r.label}</span>
									</span>
								</td>
								<td className="py-2 text-right font-mono text-white">
									{r.count.toLocaleString()}
								</td>
								<td className="py-2 text-right font-mono text-[#888]">
									{Math.round((r.count / totalPages) * 100)}%
								</td>
								<td className="py-2 text-right font-mono text-[#888]">
									{r.impressions.toLocaleString()}
								</td>
								<td className="py-2 text-right font-mono text-[#888]">
									{r.clicks.toLocaleString()}
								</td>
								<td className="py-2 text-right font-mono text-[#888]">
									{r.sessions.toLocaleString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
