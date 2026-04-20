import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useSeoCrawler } from "../../../contexts/SeoCrawlerContext";
import {
	COMPARISON_ROWS,
	type CompetitorProfile,
} from "../../../services/CompetitorMatrixConfig";
import { findKeywordGaps } from "../../../services/KeywordDiscoveryService";
import WinLoseBar from "./shared/WinLoseBar";
import EmptyState from "./shared/EmptyState";
import {
	CARD,
	CARD_HIGHLIGHT,
	KEY_NUMBER,
	SECTION_HEADER_WITH_MARGIN,
	SIDEBAR_SCROLL,
} from "./shared/styles";
import { useCompetitiveMetrics } from "./hooks/useCompetitiveMetrics";

function getNestedValue(obj: unknown, path: string): unknown {
	return path.split(".").reduce<unknown>((acc, key) => {
		if (
			acc &&
			typeof acc === "object" &&
			key in (acc as Record<string, unknown>)
		) {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

function profilePages(
	profile: CompetitorProfile,
): Array<{ url: string; title: string }> {
	return [...(profile.topOrganicPages || []), ...(profile.topBlogPages || [])]
		.filter((p) => p?.url)
		.map((p) => ({ url: p.url, title: p.title || "" }));
}

function computeWinLossTie(
	own: CompetitorProfile | null,
	comp: CompetitorProfile,
) {
	if (!own) return { wins: 0, losses: 0, ties: 0 };

	let wins = 0;
	let losses = 0;
	let ties = 0;

	const numericRows = COMPARISON_ROWS.filter((row) =>
		["number", "score_100"].includes(row.format),
	);
	for (const row of numericRows) {
		const ownVal = getNestedValue(own, String(row.profileKey));
		const compVal = getNestedValue(comp, String(row.profileKey));
		if (ownVal == null || compVal == null) continue;

		const ov = Number(ownVal);
		const cv = Number(compVal);
		if (Number.isNaN(ov) || Number.isNaN(cv)) continue;

		const isInverse = String(row.profileKey).toLowerCase().includes("threat");
		if (isInverse) {
			if (cv > ov + 5) wins += 1;
			else if (ov > cv + 5) losses += 1;
			else ties += 1;
		} else {
			if (ov > cv + 5) wins += 1;
			else if (cv > ov + 5) losses += 1;
			else ties += 1;
		}
	}

	return { wins, losses, ties };
}

const DIMENSIONS = [
	{ label: "Search", key: "estimatedOrganicTraffic", max: 50000 },
	{ label: "Content", key: "totalIndexablePages", max: 2000 },
	{ label: "Authority", key: "referringDomains", max: 5000 },
	{ label: "Tech", key: "techHealthScore", max: 100 },
	{ label: "UX", key: "trustSignalScore", max: 100 },
	{ label: "Social", key: "socialTotalFollowers", max: 100000 },
	{ label: "AI", key: "avgGeoScore", max: 100 },
	{ label: "Fresh", key: "contentFreshnessScore", max: 100 },
] as const;

function dimensionScore(
	profile: CompetitorProfile | null,
	key: string,
	max: number,
) {
	if (!profile) return 0;
	const raw = Number(getNestedValue(profile, key) || 0);
	return Math.min(100, Math.round((raw / max) * 100));
}

export default function CompOverviewTab() {
	const { pages } = useSeoCrawler();
	const { ownProfile, activeComps, advantages, vulnerabilities } =
		useCompetitiveMetrics();
	const [actionPlan, setActionPlan] = useState<string | null>(null);
	const [generatingPlan, setGeneratingPlan] = useState(false);

	const compPages = useMemo(
		() => activeComps.flatMap((comp) => profilePages(comp)),
		[activeComps],
	);
	const keywordGapCount = useMemo(() => {
		if (!pages || pages.length === 0) return 0;
		return findKeywordGaps(pages, compPages).length;
	}, [pages, compPages]);

	const winLossData = useMemo(
		() =>
			activeComps.map((comp) => ({
				domain: comp.domain,
				...computeWinLossTie(ownProfile, comp),
			})),
		[ownProfile, activeComps],
	);

	const dimensionScores = useMemo(() => {
		return DIMENSIONS.map((dim) => {
			const yours = dimensionScore(ownProfile, dim.key, dim.max);
			const compAvg =
				activeComps.length > 0
					? Math.round(
							activeComps.reduce(
								(sum, c) => sum + dimensionScore(c, dim.key, dim.max),
								0,
							) / activeComps.length,
						)
					: 0;
			return { ...dim, yours, compAvg };
		});
	}, [ownProfile, activeComps]);

	const yourScore = ownProfile?.overallSeoScore ?? 0;
	const compAvgScore =
		activeComps.length > 0
			? Math.round(
					activeComps.reduce(
						(sum, c) => sum + Number(c.overallSeoScore || 0),
						0,
					) / activeComps.length,
				)
			: 0;
	const scoreDelta = yourScore - compAvgScore;

	const generateActionPlan = async () => {
		if (!ownProfile || activeComps.length === 0) return;
		setGeneratingPlan(true);
		try {
			const topVulnerability = vulnerabilities[0]?.label || "content volume";
			const topAdvantage = advantages[0]?.label || "technical health";
			const plan =
				`Focus the next 30 days on ${topVulnerability.toLowerCase()}. ` +
				`Leverage your strength in ${topAdvantage.toLowerCase()} while closing this gap. ` +
				`Publish ${Math.max(8, Math.round((ownProfile.blogPostsPerMonth || 0) * 2))} posts this month targeting ${keywordGapCount} keyword gaps.`;
			setActionPlan(plan);
		} finally {
			setGeneratingPlan(false);
		}
	};

	if (!ownProfile && activeComps.length === 0) {
		return (
			<div className={SIDEBAR_SCROLL}>
				<EmptyState
					icon={<Users size={24} />}
					message="No competitive data yet. Add competitors and run a crawl."
				/>
			</div>
		);
	}

	return (
		<div className={SIDEBAR_SCROLL}>
			<div className={CARD}>
				<div className={SECTION_HEADER_WITH_MARGIN}>
					Your Competitive Position
				</div>
				<div className="mb-3 flex items-end justify-between">
					<div>
						<div className="mb-1 text-[10px] text-[#666]">Your Score</div>
						<div className={KEY_NUMBER}>{yourScore}</div>
					</div>
					<div className="text-right">
						<div className="mb-1 text-[10px] text-[#666]">Competitor Avg</div>
						<div className="font-mono text-[20px] font-black text-[#666]">
							{compAvgScore}
						</div>
					</div>
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center gap-2">
						<span className="w-[30px] text-[10px] text-[#F5364E]">You</span>
						<div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#111]">
							<div
								className="h-full rounded-full bg-[#F5364E]"
								style={{ width: `${yourScore}%` }}
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-[30px] text-[10px] text-[#555]">Avg</span>
						<div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#111]">
							<div
								className="h-full rounded-full bg-[#444]"
								style={{ width: `${compAvgScore}%` }}
							/>
						</div>
					</div>
				</div>
				{scoreDelta !== 0 && (
					<div
						className={`mt-2 text-[11px] ${scoreDelta > 0 ? "text-green-400" : "text-red-400"}`}
					>
						{scoreDelta > 0 ? "Ahead" : "Behind"} by {Math.abs(scoreDelta)}{" "}
						points
					</div>
				)}
			</div>

			<div className={CARD}>
				<div className={SECTION_HEADER_WITH_MARGIN}>Competitive Dimensions</div>
				<div className="space-y-2.5">
					{dimensionScores.map((dim) => {
						const winning = dim.yours >= dim.compAvg;
						return (
							<div key={dim.label}>
								<div className="mb-1 flex items-center justify-between">
									<span className="text-[11px] text-[#888]">{dim.label}</span>
									<span
										className={`text-[10px] font-bold ${winning ? "text-green-400" : "text-red-400"}`}
									>
										{dim.yours} vs {dim.compAvg}
									</span>
								</div>
								<div className="flex gap-1">
									<div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
										<div
											className="h-full rounded-full bg-[#F5364E]"
											style={{ width: `${dim.yours}%` }}
										/>
									</div>
									<div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
										<div
											className="h-full rounded-full bg-[#555]"
											style={{ width: `${dim.compAvg}%` }}
										/>
									</div>
								</div>
								<div className="mt-0.5 flex justify-between text-[9px] text-[#444]">
									<span>You</span>
									<span>Comp Avg</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className={CARD}>
				<div className={SECTION_HEADER_WITH_MARGIN}>Head-to-Head</div>
				{winLossData.length > 0 ? (
					<div className="space-y-2">
						{winLossData.map((wl) => (
							<WinLoseBar key={wl.domain} {...wl} />
						))}
					</div>
				) : (
					<p className="py-2 text-center text-[11px] text-[#555]">
						No competitors to compare.
					</p>
				)}
			</div>

			<div className={CARD}>
				<div className={SECTION_HEADER_WITH_MARGIN}>Publishing Pace</div>
				<div className="space-y-2">
					{ownProfile && (
						<div className="flex items-center gap-2">
							<span className="w-[80px] truncate text-[10px] text-[#F5364E]">
								You
							</span>
							<div className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
								<div
									className="h-full rounded-full bg-[#F5364E]"
									style={{
										width: `${Math.min(100, ((ownProfile.blogPostsPerMonth || 0) / 20) * 100)}%`,
									}}
								/>
							</div>
							<span className="w-[40px] text-right font-mono text-[10px] text-white">
								{ownProfile.blogPostsPerMonth || 0}/mo
							</span>
						</div>
					)}
					{activeComps.map((comp, i) => (
						<div key={comp.domain} className="flex items-center gap-2">
							<span className="w-[80px] truncate text-[10px] text-[#888]">
								{comp.domain}
							</span>
							<div className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#1a1a1e]">
								<div
									className="h-full rounded-full"
									style={{
										width: `${Math.min(100, ((comp.blogPostsPerMonth || 0) / 20) * 100)}%`,
										backgroundColor: [
											"#6366f1",
											"#06b6d4",
											"#f59e0b",
											"#10b981",
											"#ec4899",
										][i % 5],
									}}
								/>
							</div>
							<span className="w-[40px] text-right font-mono text-[10px] text-[#888]">
								{comp.blogPostsPerMonth || 0}/mo
							</span>
						</div>
					))}
				</div>
			</div>

			{advantages.length > 0 && (
				<div className={CARD}>
					<div className={SECTION_HEADER_WITH_MARGIN}>Where You Win</div>
					<div className="space-y-2">
						{advantages.map((a, i) => (
							<div
								key={`${a.label}-${i}`}
								className="flex items-center justify-between"
							>
								<span className="text-[11px] text-green-400">✓ {a.label}</span>
								<span className="font-mono text-[11px] font-bold text-green-400">
									{a.delta}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{vulnerabilities.length > 0 && (
				<div className={CARD}>
					<div className={SECTION_HEADER_WITH_MARGIN}>Where You Lose</div>
					<div className="space-y-2">
						{vulnerabilities.map((v, i) => (
							<div
								key={`${v.label}-${i}`}
								className="flex items-center justify-between"
							>
								<span className="text-[11px] text-red-400">✗ {v.label}</span>
								<span className="font-mono text-[11px] font-bold text-red-400">
									{v.delta}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{vulnerabilities.length > 0 && (
				<div className={CARD_HIGHLIGHT}>
					<div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#F5364E]">
						#1 Priority
					</div>
					<p className="text-[12px] leading-relaxed text-[#ccc]">
						{`Focus on ${vulnerabilities[0].label.toLowerCase()} - you're at ${vulnerabilities[0].delta} vs competitor average. This is your biggest gap.`}
					</p>
				</div>
			)}

			<div className={CARD_HIGHLIGHT}>
				{!actionPlan ? (
					<button
						onClick={generateActionPlan}
						disabled={generatingPlan || !ownProfile}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5364E]/10 py-2.5 text-[11px] font-bold text-[#F5364E] transition hover:bg-[#F5364E]/20 disabled:opacity-30"
					>
						{generatingPlan ? "Thinking..." : "What should I do next? →"}
					</button>
				) : (
					<>
						<div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F5364E]">
							30-Day Priority
						</div>
						<p className="text-[12px] leading-relaxed text-[#ccc]">
							{actionPlan}
						</p>
						<button
							onClick={() => setActionPlan(null)}
							className="mt-2 text-[10px] text-[#555] hover:text-[#888]"
						>
							Dismiss
						</button>
					</>
				)}
			</div>
		</div>
	);
}
