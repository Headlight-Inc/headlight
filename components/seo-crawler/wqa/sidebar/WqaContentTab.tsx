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
	fmtScore,
	scoreTone,
} from "./shared";
import StackedBar from "../charts/StackedBar";

export default function WqaContentTab() {
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

	const ageMix = [
		{
			label: "Fresh",
			value: wqaFacets.contentAges.fresh || 0,
			color: "#22c55e",
		},
		{
			label: "Aging",
			value: wqaFacets.contentAges.aging || 0,
			color: "#3b82f6",
		},
		{
			label: "Stale",
			value: wqaFacets.contentAges.stale || 0,
			color: "#f59e0b",
		},
		{
			label: "No date",
			value: wqaFacets.contentAges.nodate || 0,
			color: "#444",
		},
	];

	const funnelMix = Object.entries(wqaFacets.funnelStages || {}).map(
		([label, value], i) => ({
			label,
			value,
			color: ["#F5364E", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"][i % 5],
		}),
	);

	const thinPages = useMemo(
		() =>
			(pages || [])
				.filter(
					(p) =>
						p.isHtmlPage &&
						Number(p.statusCode) === 200 &&
						Number(p.wordCount || 0) > 0 &&
						Number(p.wordCount) < 300,
				)
				.sort((a, b) => Number(a.wordCount || 0) - Number(b.wordCount || 0))
				.slice(0, 5),
		[pages],
	);

	const decaying = useMemo(
		() =>
			(pages || [])
				.filter((p) => Number(p.contentDecayRisk || 0) > 40)
				.sort(
					(a, b) =>
						Number(b.contentDecayRisk || 0) - Number(a.contentDecayRisk || 0),
				)
				.slice(0, 5),
		[pages],
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-1.5">
				<StatTile
					label="Content score"
					value={fmtScore(stats.avgContentQuality)}
					tone={scoreTone(stats.avgContentQuality)}
				/>
				<StatTile
					label="E-E-A-T"
					value={fmtScore(stats.avgEeat)}
					tone={scoreTone(stats.avgEeat)}
				/>
				<StatTile
					label="Thin content"
					value={fmtPct(stats.thinContentRate, 1)}
					tone={stats.thinContentRate > 20 ? "bad" : "neutral"}
				/>
				<StatTile
					label="Duplicate"
					value={fmtPct(stats.duplicateRate, 1)}
					tone={stats.duplicateRate > 10 ? "warn" : "neutral"}
				/>
			</div>

			<Card>
				<SectionTitle title="Content freshness" />
				<StackedBar data={ageMix} />
				{stats.decayRiskCount > 0 && (
					<button
						onClick={() => setWqaFilter({ ...wqaFilter, contentAge: "stale" })}
						className="w-full mt-3"
					>
						<Row
							label="Decay risk pages"
							value={fmtInt(stats.decayRiskCount)}
							hint="Age + traffic loss + position drop"
							tone="warn"
						/>
					</button>
				)}
			</Card>

			{funnelMix.length > 0 && (
				<Card>
					<SectionTitle title="Funnel coverage" />
					<StackedBar data={funnelMix} />
				</Card>
			)}

			<Card>
				<SectionTitle title="Structural quality" />
				<Row
					label="Schema coverage"
					value={fmtPct(stats.schemaCoverage, 1)}
					tone={
						stats.schemaCoverage >= 80
							? "good"
							: stats.schemaCoverage >= 40
								? "warn"
								: "bad"
					}
				/>
				<Row
					label="Avg word count"
					value={fmtInt(
						pages?.length
							? Math.round(
									pages.reduce((s, p) => s + Number(p.wordCount || 0), 0) /
										pages.length,
								)
							: 0,
					)}
				/>
				<Row
					label="Orphan rate"
					value={fmtPct(stats.orphanRate, 1)}
					tone={stats.orphanRate > 15 ? "warn" : "neutral"}
				/>
			</Card>

			{thinPages.length > 0 && (
				<div>
					<SectionTitle title="Thinnest pages" />
					<Card pad={false}>
						{thinPages.map((p) => (
							<button
								key={p.url}
								onClick={() => setSelectedPage(p)}
								className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors"
							>
								<div className="text-[11px] font-mono text-blue-400 truncate">
									{p.url}
								</div>
								<div className="text-[10px] text-[#888] mt-0.5">
									<span className="text-red-400 font-bold">
										{fmtInt(p.wordCount)} words
									</span>
									{p.title && (
										<span className="ml-2">{String(p.title).slice(0, 40)}</span>
									)}
								</div>
							</button>
						))}
					</Card>
				</div>
			)}

			{decaying.length > 0 && (
				<div>
					<SectionTitle title="Decay risk" />
					<Card pad={false}>
						{decaying.map((p) => (
							<button
								key={p.url}
								onClick={() => setSelectedPage(p)}
								className="w-full text-left px-3 py-2 border-b border-[#161616] last:border-b-0 hover:bg-[#111] transition-colors"
							>
								<div className="text-[11px] font-mono text-blue-400 truncate">
									{p.url}
								</div>
								<div className="text-[10px] text-[#888] mt-0.5 flex items-center gap-3">
									<span className="text-orange-400 font-bold">
										Risk {fmtScore(p.contentDecayRisk)}
									</span>
									<span>{p.contentAge || "—"}</span>
								</div>
								<div className="mt-1">
									<Bar pct={Number(p.contentDecayRisk || 0)} tone="warn" />
								</div>
							</button>
						))}
					</Card>
				</div>
			)}
		</div>
	);
}
