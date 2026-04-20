import React, { useMemo, useState } from "react";
import { GitBranch, Layers, Share2 } from "lucide-react";
import { useSeoCrawler } from "../../../../contexts/SeoCrawlerContext";
import { ViewHeader, EmptyViewState } from "./shared";
import MapTreeMode from "./map/MapTreeMode";
import MapClusterMode from "./map/MapClusterMode";
import MapGraphMode from "./map/MapGraphMode";
import MapCoverageStrip from "./map/MapCoverageStrip";
import type { WqaMapSubmode } from "../../../../services/WebsiteQualityModeTypes";

const SUBMODES: Array<{
	id: WqaMapSubmode;
	label: string;
	Icon: React.ElementType;
	hint: string;
}> = [
	{ id: "tree", label: "Tree", Icon: GitBranch, hint: "URL hierarchy by path" },
	{
		id: "cluster",
		label: "Cluster",
		Icon: Layers,
		hint: "Grouped by page category",
	},
	{ id: "graph", label: "Graph", Icon: Share2, hint: "Internal link graph" },
];

export default function WqaMapView() {
	const { filteredPages } = useSeoCrawler() as any;
	const [submode, setSubmode] = useState<WqaMapSubmode>("tree");

	const empty = !filteredPages || filteredPages.length === 0;

	const body = useMemo(() => {
		if (empty) {
			return (
				<EmptyViewState
					title="No pages to map"
					subtitle="Run a crawl or clear filters to populate the site map."
				/>
			);
		}
		switch (submode) {
			case "cluster":
				return <MapClusterMode pages={filteredPages} />;
			case "graph":
				return <MapGraphMode pages={filteredPages} />;
			case "tree":
			default:
				return <MapTreeMode pages={filteredPages} />;
		}
	}, [empty, submode, filteredPages]);

	return (
		<div className="flex-1 flex flex-col bg-[#070707] overflow-hidden">
			<ViewHeader
				title="Map"
				subtitle={SUBMODES.find((s) => s.id === submode)?.hint}
				right={
					<div className="flex items-center bg-[#0a0a0a] rounded-md border border-[#1e1e1e] p-0.5 gap-0.5">
						{SUBMODES.map(({ id, label, Icon }) => {
							const active = submode === id;
							return (
								<button
									key={id}
									onClick={() => setSubmode(id)}
									className={`px-2.5 h-[24px] text-[11px] font-medium rounded flex items-center gap-1.5 transition-colors ${
										active
											? "bg-[#1a1a1a] text-white"
											: "text-[#888] hover:text-[#ddd] hover:bg-[#141414]"
									}`}
								>
									<Icon size={11} className={active ? "text-[#F5364E]" : ""} />
									<span>{label}</span>
								</button>
							);
						})}
					</div>
				}
			/>
			<MapCoverageStrip pages={filteredPages} />
			<div className="flex-1 min-h-0 relative">{body}</div>
		</div>
	);
}
