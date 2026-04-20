import React, { useMemo } from "react";
import { useSeoCrawler } from "../../../../contexts/SeoCrawlerContext";
import { computeWqaSiteStats } from "../../../../services/WqaSidebarData";
import {
	Bar,
	Card,
	Row,
	SectionTitle,
	StatTile,
	fmtInt,
	fmtPct,
} from "./shared";
import ScatterPlot from "../charts/ScatterPlot";
import StackedBar from "../charts/StackedBar";

export default function WqaSearchTab() {
	const {
		pages,
		wqaState,
		wqaFacets,
		wqaFilter,
		setWqaFilter,
		setSelectedPage,
	} = useSeoCrawler();
	const industry =
		wqaState.industryOverride || wqaState.detectedIndustry || "general";
	const stats = useMemo(
		() => computeWqaSiteStats(pages || [], industry as any),
		[pages, industry],
	);

	// Position × CTR scatter (striking distance quadrant)
	const scatter = useMemo(
		() =>
			(pages || [])
				.filter(
					(p) =>
						Number(p.gscImpressions || 0) > 50 &&
						Number(p.gscPosition || 0) > 0 &&
						Number(p.gscPosition || 0) <= 50,
				)
				.slice(0, 200)
				.map((p) => ({
					x: Number(p.gscPosition),
					y: Number(p.gscCtr || 0) * 100,
					url: p.url,
				})),
		[pages],
	);

	const posMix = [
		{
			label: "Top 3",
			value: wqaFacets.searchStatuses.top3 || 0,
			color: "#22c55e",
		},
		{
			label: "Page 1",
			value: wqaFacets.searchStatuses.page1 || 0,
			color: "#3b82f6",
		},
		{
			label: "Striking",
			value: wqaFacets.searchStatuses.striking || 0,
			color: "#F5364E",
		},
		{
			label: "Weak",
			value: wqaFacets.searchStatuses.weak || 0,
			color: "#f59e0b",
		},
		{
			label: "No rank",
			value: wqaFacets.searchStatuses.none || 0,
			color: "#444",
		},
	];

	const trafficMix = [
		{
			label: "Growing",
			value: wqaFacets.trafficStatuses.growing || 0,
			color: "#22c55e",
		},
		{
			label: "Stable",
			value: wqaFacets.trafficStatuses.stable || 0,
			color: "#3b82f6",
		},
		{
			label: "Declining",
			value: wqaFacets.trafficStatuses.declining || 0,
			color: "#ef4444",
		},
		{
			label: "No traffic",
			value: wqaFacets.trafficStatuses.none || 0,
			color: "#444",
		},
	];

	// Top winners / losers
	const losers = useMemo(
		() =>
			(pages || [])
				.filter((p) => p.isLosingTraffic && Number(p.gscImpressions || 0) > 100)
				.sort(
					(a, b) =>
						Number(a.sessionsDeltaPct || 0) - Number(b.sessionsDeltaPct || 0),
				)
				.slice(0, 5),
		[pages],
	);

	const strikers = useMemo(
		() =>
			(pages || [])
				.filter((p) => {
					const pos = Number(p.gscPosition || 0);
					return pos > 3 && pos <= 20 && Number(p.gscImpressions || 0) > 100;
				})
				.sort(
					(a, b) =>
						Number(b.gscImpressions || 0) - Number(a.gscImpressions || 0),
				)
				.slice(0, 5),
		[pages],
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-1.5">
				<StatTile label="Impressions" value={fmtInt(stats.totalImpressions)} />
				<StatTile label="Clicks" value={fmtInt(stats.totalClicks)} />
				<StatTile
					label="Avg CTR"
					value={fmtPct((stats.avgCtr || 0) * 100, 2)}
				/>
				<StatTile
					label="Avg Pos."
					value={stats.avgPosition ? stats.avgPosition.toFixed(1) : "—"}
				/>
			</div>

			{scatter.length > 0 && (
				<Card>
					<SectionTitle
						title="Position × CTR"
						hint="low-right = striking distance"
					/>
					<ScatterPlot
						data={scatter}
						xLabel="Position"
						yLabel="CTR %"
						height={160}
					/>
				</Card>
			)}

			<Card>
				<SectionTitle title="Ranking distribution" />
				<StackedBar data={posMix} />
				<div className="mt-3 space-y-0.5">
					<button
						onClick={() =>
							setWqaFilter({ ...wqaFilter, searchStatus: "striking" })
						}
						className="w-full"
					>
						<Row
							label="Striking distance (4–20)"
							value={fmtInt(stats.pagesInStrikingDistance)}
							tone="warn"
						/>
					</button>
					<button
						onClick={() => setWqaFilter({ ...wqaFilter, searchStatus: "none" })}
						className="w-full"
					>
						<Row
							label="Zero impressions"
							value={fmtInt(stats.pagesWithZeroImpressions)}
							tone={stats.pagesWithZeroImpressions > 0 ? "warn" : "neutral"}
						/>
					</button>
				</div>
			</Card>

			<Card>
				<SectionTitle title="Traffic trend" hint="30-day delta" />
				<StackedBar data={trafficMix} />
			</Card>

			{losers.length > 0 && (
				<div>
					<SectionTitle title="Biggest traffic drops" />
					<Card pad={false}>
						{losers.map((p) => (
							<button
								key={p.url}
								onClick={() => setSelectedPage(p)}
								className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors"
							>
								<div className="text-[11px] font-mono text-blue-400 truncate">
									{p.url}
								</div>
								<div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
									<span className="text-red-400 font-bold">
										{Number(p.sessionsDeltaPct || 0).toFixed(0)}%
									</span>
									<span>{fmtInt(p.gscClicks)} clicks</span>
									<span>pos {Number(p.gscPosition || 0).toFixed(1)}</span>
								</div>
							</button>
						))}
					</Card>
				</div>
			)}

			{strikers.length > 0 && (
				<div>
					<SectionTitle title="Quick wins (striking distance)" />
					<Card pad={false}>
						{strikers.map((p) => (
							<button
								key={p.url}
								onClick={() => setSelectedPage(p)}
								className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors"
							>
								<div className="text-[11px] font-mono text-blue-400 truncate">
									{p.url}
								</div>
								<div className="text-[10px] text-[#888] flex items-center gap-3 mt-0.5">
									<span className="text-[#F5364E] font-bold">
										pos {Number(p.gscPosition).toFixed(1)}
									</span>
									<span>{fmtInt(p.gscImpressions)} impr</span>
									<span>CTR {(Number(p.gscCtr || 0) * 100).toFixed(2)}%</span>
								</div>
							</button>
						))}
					</Card>
				</div>
			)}

			<Card>
				<SectionTitle title="Coverage gap" />
				<Row label="Indexed pages" value={fmtInt(stats.indexedPages)} />
				<Row
					label="With impressions"
					value={fmtInt(stats.indexedPages - stats.pagesWithZeroImpressions)}
					tone="good"
				/>
				<Row
					label="Zero impressions"
					value={fmtInt(stats.pagesWithZeroImpressions)}
					tone={stats.pagesWithZeroImpressions > 0 ? "warn" : "neutral"}
				/>
				<div className="mt-2">
					<Bar
						pct={
							stats.indexedPages
								? ((stats.indexedPages - stats.pagesWithZeroImpressions) /
										stats.indexedPages) *
									100
								: 0
						}
						tone="good"
					/>
				</div>
			</Card>
		</div>
	);
}
