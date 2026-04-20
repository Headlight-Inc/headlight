import React from "react";

interface BulkActionsBarProps {
	selectedCount: number;
	onAssign: () => void;
	onExport: () => void;
	onAIAnalyze: () => void;
	onCreateTask: () => void;
	onClear: () => void;
}

export default function BulkActionsBar({
	selectedCount,
	onAssign,
	onExport,
	onAIAnalyze,
	onCreateTask,
	onClear,
}: BulkActionsBarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 animate-in slide-in-from-bottom-4">
			<div className="flex items-center gap-3 rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-2.5 shadow-2xl">
				<span className="font-mono text-[12px] text-white">
					{selectedCount} selected
				</span>
				<div className="h-5 w-px bg-[#333]" />
				<button
					onClick={onAssign}
					className="rounded px-2 py-1 text-[11px] text-[#ccc] hover:bg-[#222] hover:text-white"
				>
					Assign All
				</button>
				<button
					onClick={onExport}
					className="rounded px-2 py-1 text-[11px] text-[#ccc] hover:bg-[#222] hover:text-white"
				>
					Export Selected
				</button>
				<button
					onClick={onAIAnalyze}
					className="rounded px-2 py-1 text-[11px] text-[#ccc] hover:bg-[#222] hover:text-white"
				>
					AI Analyze
				</button>
				<button
					onClick={onCreateTask}
					className="rounded px-2 py-1 text-[11px] text-[#ccc] hover:bg-[#222] hover:text-white"
				>
					Create Task
				</button>
				<button
					onClick={onClear}
					className="px-1 text-[11px] text-[#666] hover:text-white"
				>
					x
				</button>
			</div>
		</div>
	);
}
