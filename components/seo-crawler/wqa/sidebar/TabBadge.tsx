import React from "react";
import { toneColor, type WqaSidebarTone } from "./tokens";

export default function TabBadge({
	count,
	tone = "neutral",
}: {
	count: number;
	tone?: WqaSidebarTone;
}) {
	if (!count) return null;
	const bg = tone === "neutral" ? "#1a1a1a" : `${toneColor(tone)}22`;
	const fg = tone === "neutral" ? "#aaa" : toneColor(tone);
	return (
		<span
			style={{ background: bg, color: fg }}
			className="ml-1 px-1.5 py-[1px] rounded-full text-[9px] font-mono font-bold leading-none"
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}
