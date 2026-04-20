export interface ParsedLogEntry {
	ip: string;
	timestamp: string;
	method: string;
	url: string;
	status: number;
	userAgent: string;
}

export interface BotVisitMetrics {
	googlebotVisits30d: number;
	googlebotLastVisit: string | null;
	aiBotVisits30d: number;
	botCrawlBudgetShare: number;
	botServerErrors: number;
}

const commonRegex =
	/^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) \S+" (\d+) (\d+|-)/;

export class LogFileAnalysisService {
	static parse(content: string): ParsedLogEntry[] {
		return content
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean)
			.flatMap((line) => {
				if (line.startsWith("{")) {
					try {
						const json = JSON.parse(line);
						return [
							{
								ip: String(json.ClientIP || json.ip || ""),
								timestamp: String(json.Timestamp || json.time || ""),
								method: String(
									json.ClientRequestMethod || json.method || "GET",
								),
								url: String(json.ClientRequestURI || json.url || ""),
								status: Number(json.EdgeResponseStatus || json.status || 0),
								userAgent: String(
									json.ClientRequestUserAgent || json.userAgent || "",
								),
							},
						];
					} catch {
						return [];
					}
				}

				const match = line.match(commonRegex);
				if (!match) return [];
				return [
					{
						ip: match[1],
						timestamp: match[2],
						method: match[3],
						url: match[4],
						status: Number(match[5]),
						userAgent: line.split('"').slice(-2, -1)[0] || "",
					},
				];
			});
	}

	static classifyBot(userAgent: string) {
		const ua = userAgent.toLowerCase();
		if (ua.includes("googlebot")) return "googlebot";
		if (ua.includes("bingbot")) return "bingbot";
		if (ua.includes("duckduckbot")) return "duckduckbot";
		if (ua.includes("yandex")) return "yandex";
		if (ua.includes("baidu")) return "baidu";
		if (ua.includes("gptbot")) return "gptbot";
		if (ua.includes("claudebot")) return "claudebot";
		if (ua.includes("perplexity")) return "perplexity";
		if (ua.includes("bytespider")) return "bytespider";
		return null;
	}

	static aggregate(entries: ParsedLogEntry[]) {
		const totals = {
			totalBotRequests: 0,
			googlebot: 0,
			aiBots: 0,
		};

		const byUrl = new Map<string, BotVisitMetrics>();

		entries.forEach((entry) => {
			const bot = this.classifyBot(entry.userAgent);
			if (!bot) return;
			totals.totalBotRequests += 1;
			if (bot === "googlebot") totals.googlebot += 1;
			if (["gptbot", "claudebot", "perplexity", "bytespider"].includes(bot))
				totals.aiBots += 1;

			const current = byUrl.get(entry.url) || {
				googlebotVisits30d: 0,
				googlebotLastVisit: null,
				aiBotVisits30d: 0,
				botCrawlBudgetShare: 0,
				botServerErrors: 0,
			};

			if (bot === "googlebot") {
				current.googlebotVisits30d += 1;
				current.googlebotLastVisit =
					current.googlebotLastVisit &&
					current.googlebotLastVisit > entry.timestamp
						? current.googlebotLastVisit
						: entry.timestamp;
			}
			if (["gptbot", "claudebot", "perplexity", "bytespider"].includes(bot)) {
				current.aiBotVisits30d += 1;
			}
			if (entry.status >= 500) {
				current.botServerErrors += 1;
			}

			byUrl.set(entry.url, current);
		});

		byUrl.forEach((metrics) => {
			metrics.botCrawlBudgetShare = totals.totalBotRequests
				? Number(
						(metrics.googlebotVisits30d + metrics.aiBotVisits30d) /
							totals.totalBotRequests,
					)
				: 0;
		});

		return { totals, byUrl };
	}

	static applyToPages(pages: any[], entries: ParsedLogEntry[]) {
		const { totals, byUrl } = this.aggregate(entries);
		const updatedPages = pages.map((page) => {
			const direct = byUrl.get(page.url);
			const path = this.safePath(page.url);
			const fallbackMatch =
				!direct && path
					? Array.from(byUrl.entries()).find(
							([entryUrl]) => this.safePath(entryUrl) === path,
						)?.[1]
					: null;
			const metrics = direct || fallbackMatch;
			return metrics ? { ...page, ...metrics } : page;
		});

		return {
			pages: updatedPages,
			totals,
		};
	}

	private static safePath(value: string) {
		try {
			return new URL(value).pathname;
		} catch {
			return value;
		}
	}
}

export default LogFileAnalysisService;
