import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { WqaSiteStats } from "../../../../services/WebsiteQualityModeTypes";

type Blocker = {
	key: string;
	label: string;
	fix: string;
	score: number;
	filterAction?: () => void;
};

export default function TopBlockerCallout({
	stats,
	onGoto,
}: {
	stats: WqaSiteStats;
	onGoto?: (key: string) => void;
}) {
	const candidates: Blocker[] = [
		{
			key: "broken",
			label: `${stats.brokenRate.toFixed(1)}% broken pages`,
			fix: "Fix 4xx/5xx",
			score: stats.brokenRate * 3,
		},
		{
			key: "zero",
			label: `${stats.pagesWithZeroImpressions} pages with 0 impressions`,
			fix: "Review indexability",
			score: stats.pagesWithZeroImpressions * 0.6,
		},
		{
			key: "orphan",
			label: `${stats.orphanRate.toFixed(1)}% orphan pages`,
			fix: "Add internal links",
			score: stats.orphanRate * 2,
		},
		{
			key: "thin",
			label: `${stats.thinContentRate.toFixed(1)}% thin content`,
			fix: "Expand or merge",
			score: stats.thinContentRate * 2,
		},
		{
			key: "decay",
			label: `${stats.decayRiskCount} decaying pages`,
			fix: "Refresh top decliners",
			score: stats.decayRiskCount * 0.8,
		},
		{
			key: "canniba",
			label: `${stats.cannibalizationCount} cannibalized pages`,
			fix: "Consolidate duplicates",
			score: stats.cannibalizationCount * 1.2,
		},
	];
	const top = candidates.sort((a, b) => b.score - a.score)[0];
	if (!top || top.score < 5) return null;

	return (
		<button
			onClick={() => onGoto?.(top.key)}
			className="w-full text-left rounded border border-[#F5364E]/40 bg-[#F5364E]/8 hover:bg-[#F5364E]/15 transition-colors p-3"
		>
			<div className="flex items-center gap-2">
				<AlertTriangle size={14} className="text-[#F5364E]" />
				<div className="text-[10px] uppercase tracking-widest text-[#F5364E] font-bold">
					Top blocker
				</div>
			</div>
			<div className="mt-1 text-[13px] font-bold text-white">{top.label}</div>
			<div className="mt-0.5 text-[11px] text-[#aaa] flex items-center gap-1">
				{top.fix}
				<ArrowRight size={10} />
			</div>
		</button>
	);
}
