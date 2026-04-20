import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { getPageIssues } from "./IssueTaxonomy";

interface MobilePageCardProps {
	page: any;
	index: number;
	onOpen: (page: any) => void;
}

const getStatusTone = (statusCode: number) => {
	if (statusCode >= 500) return "text-red-300 bg-red-500/10 border-red-500/20";
	if (statusCode >= 400) return "text-red-200 bg-red-500/10 border-red-500/20";
	if (statusCode >= 300)
		return "text-amber-200 bg-amber-500/10 border-amber-500/20";
	return "text-emerald-200 bg-emerald-500/10 border-emerald-500/20";
};

export default function MobilePageCard({
	page,
	index,
	onOpen,
}: MobilePageCardProps) {
	const issues = useMemo(() => getPageIssues(page), [page]);
	const primaryIssue = issues[0];
	const pathname = useMemo(() => {
		try {
			return new URL(page.url).pathname || "/";
		} catch {
			return page.url;
		}
	}, [page.url]);

	return (
		<button
			type="button"
			onClick={() => onOpen(page)}
			className="w-full rounded-2xl border border-[#242428] bg-[#101013] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors hover:border-[#313138]"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="text-[10px] uppercase tracking-[0.24em] text-[#666]">
						Page {index + 1}
					</div>
					<div className="mt-1 truncate text-[14px] font-semibold text-white">
						{pathname}
					</div>
					<div className="mt-1 truncate text-[11px] text-[#6d93ff]">
						{page.url}
					</div>
				</div>
				<div
					className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusTone(Number(page.statusCode || 0))}`}
				>
					{page.statusCode || "---"}
				</div>
			</div>

			<div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
				<div className="rounded-xl border border-[#1c1c20] bg-[#0b0b0d] p-3">
					<div className="text-[#666]">Score</div>
					<div className="mt-1 text-[16px] font-black text-white">
						{page.healthScore ?? "--"}
					</div>
				</div>
				<div className="rounded-xl border border-[#1c1c20] bg-[#0b0b0d] p-3">
					<div className="text-[#666]">LCP</div>
					<div className="mt-1 text-[16px] font-black text-white">
						{page.lcp ? `${(Number(page.lcp) / 1000).toFixed(1)}s` : "--"}
					</div>
				</div>
				<div className="rounded-xl border border-[#1c1c20] bg-[#0b0b0d] p-3">
					<div className="text-[#666]">Words</div>
					<div className="mt-1 text-[16px] font-black text-white">
						{page.wordCount ?? 0}
					</div>
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between rounded-xl border border-[#22252a] bg-[#0b0c10] px-3 py-2.5">
				<div className="min-w-0">
					<div className="text-[10px] uppercase tracking-[0.22em] text-[#666]">
						Primary issue
					</div>
					<div className="mt-1 truncate text-[12px] text-[#ddd]">
						{primaryIssue?.label || "No major issues detected"}
					</div>
				</div>
				<ChevronRight size={16} className="shrink-0 text-[#777]" />
			</div>
		</button>
	);
}
