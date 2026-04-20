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

export default function WqaTechTab() {
	const { pages, wqaState, setSelectedPage } = useSeoCrawler();
	const industry =
		wqaState.industryOverride || wqaState.detectedIndustry || "general";
	const stats = useMemo(
		() => computeWqaSiteStats(pages || [], industry as any),
		[pages, industry],
	);

	// Speed bucket rollup
	const speedMix = useMemo(() => {
		const buckets = { Good: 0, "Needs work": 0, Poor: 0, Unknown: 0 };
		for (const p of pages || []) {
			const s = String(p.speedScore || "Unknown");
			if (s === "Good") buckets.Good++;
			else if (s === "Needs Improvement" || s === "Needs work")
				buckets["Needs work"]++;
			else if (s === "Poor") buckets.Poor++;
			else buckets.Unknown++;
		}
		return [
			{ label: "Good", value: buckets.Good, color: "#22c55e" },
			{ label: "Needs work", value: buckets["Needs work"], color: "#f59e0b" },
			{ label: "Poor", value: buckets.Poor, color: "#ef4444" },
			{ label: "Unknown", value: buckets.Unknown, color: "#444" },
		];
	}, [pages]);

	// Broken + redirect + canonical tallies
	const techTallies = useMemo(() => {
		let broken = 0,
			redirects = 0,
			nonIndexable = 0,
			canonMissing = 0,
			slow = 0;
		let httpInsecure = 0,
			sslIssues = 0,
			missingHsts = 0;
		for (const p of pages || []) {
			const code = Number(p.statusCode || 0);
			if (code >= 400) broken++;
			else if (code >= 300) redirects++;
			if (p.indexable === false) nonIndexable++;
			if (code === 200 && !p.canonical) canonMissing++;
			if (Number(p.loadTime || 0) > 1500) slow++;
			if (String(p.url || "").startsWith("http://")) httpInsecure++;
			if (p.sslValid === false) sslIssues++;
			if (p.hstsMissing === true) missingHsts++;
		}
		return {
			broken,
			redirects,
			nonIndexable,
			canonMissing,
			slow,
			httpInsecure,
			sslIssues,
			missingHsts,
		};
	}, [pages]);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-1.5">
				<StatTile
					label="Tech health"
					value={fmtScore(stats.avgHealthScore)}
					tone={scoreTone(stats.avgHealthScore)}
				/>
				<StatTile
					label="Speed score"
					value={fmtScore(stats.avgSpeedScore)}
					tone={scoreTone(stats.avgSpeedScore)}
				/>
				<StatTile
					label="Indexability"
					value={fmtPct(
						stats.htmlPages ? (stats.indexedPages / stats.htmlPages) * 100 : 0,
						1,
					)}
					tone={
						stats.indexedPages / Math.max(1, stats.htmlPages) >= 0.9
							? "good"
							: "warn"
					}
				/>
				<StatTile
					label="Broken rate"
					value={fmtPct(stats.brokenRate, 1)}
					tone={stats.brokenRate > 2 ? "bad" : "good"}
				/>
			</div>

			<Card>
				<SectionTitle title="Crawl health" />
				<Row label="Total crawled" value={fmtInt(stats.totalPages)} />
				<Row label="HTML pages" value={fmtInt(stats.htmlPages)} />
				<Row label="Indexable" value={fmtInt(stats.indexedPages)} tone="good" />
				<Row
					label="Non-indexable"
					value={fmtInt(techTallies.nonIndexable)}
					tone={techTallies.nonIndexable > 0 ? "warn" : "neutral"}
				/>
				<Row
					label="Broken (4xx/5xx)"
					value={fmtInt(techTallies.broken)}
					tone={techTallies.broken > 0 ? "bad" : "good"}
				/>
				<Row
					label="Redirects"
					value={fmtInt(techTallies.redirects)}
					tone={techTallies.redirects > 0 ? "warn" : "neutral"}
				/>
				<Row
					label="Missing canonical"
					value={fmtInt(techTallies.canonMissing)}
					tone={techTallies.canonMissing > 0 ? "warn" : "neutral"}
				/>
			</Card>

			<Card>
				<SectionTitle title="Speed distribution" hint="site-wide" />
				<StackedBar data={speedMix} />
				<div className="mt-3">
					<Row
						label="Slow (>1.5s TTFB)"
						value={fmtInt(techTallies.slow)}
						tone={techTallies.slow > 0 ? "warn" : "good"}
					/>
				</div>
			</Card>

			<Card>
				<SectionTitle title="Security" />
				<Row
					label="HTTP pages"
					value={fmtInt(techTallies.httpInsecure)}
					tone={techTallies.httpInsecure > 0 ? "bad" : "good"}
				/>
				<Row
					label="SSL issues"
					value={fmtInt(techTallies.sslIssues)}
					tone={techTallies.sslIssues > 0 ? "bad" : "good"}
				/>
				<Row
					label="Missing HSTS"
					value={fmtInt(techTallies.missingHsts)}
					tone={techTallies.missingHsts > 0 ? "warn" : "good"}
				/>
			</Card>

			<Card>
				<SectionTitle title="Sitemap & coverage" />
				<Row
					label="Sitemap coverage"
					value={fmtPct(stats.sitemapCoverage, 1)}
					tone={
						stats.sitemapCoverage >= 80
							? "good"
							: stats.sitemapCoverage >= 50
								? "warn"
								: "bad"
					}
				/>
				<div className="mt-1 mb-3">
					<Bar
						pct={stats.sitemapCoverage}
						tone={stats.sitemapCoverage >= 80 ? "good" : "warn"}
					/>
				</div>
				{industry === "news" && (
					<>
						<Row
							label="News sitemap"
							value={fmtPct(stats.newsSitemapCoverage, 1)}
							hint="Required for Google News"
							tone={stats.newsSitemapCoverage > 0 ? "good" : "warn"}
						/>
						<div className="mt-1">
							<Bar
								pct={stats.newsSitemapCoverage}
								tone={stats.newsSitemapCoverage > 0 ? "good" : "warn"}
							/>
						</div>
					</>
				)}
			</Card>
		</div>
	);
}
