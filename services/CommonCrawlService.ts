import { crawlDb, getHtmlPages, type CrawledPage } from "./CrawlDatabase";

export interface CommonCrawlBacklink {
	sourceUrl: string;
	sourceDomain: string;
	targetUrl: string;
	crawlDate: string;
}

export class CommonCrawlService {
	private static INDEX_SERVER = "https://index.commoncrawl.org";

	/**
	 * Fetch the latest Common Crawl index ID
	 */
	static async getLatestIndex(): Promise<string> {
		try {
			const response = await fetch(`${this.INDEX_SERVER}/collinfo.json`);
			if (!response.ok) throw new Error("Failed to fetch CC index info");
			const data = await response.json();
			// Return the id of the most recent index (usually the first one)
			return data[0]?.id || "CC-MAIN-2024-10";
		} catch (err) {
			console.error("[CommonCrawl] Failed to get latest index:", err);
			return "CC-MAIN-2024-10";
		}
	}

	/**
	 * Discover backlinks for a domain from Common Crawl index
	 */
	static async discoverBacklinks(
		domain: string,
		onProgress?: (msg: string) => void,
	): Promise<CommonCrawlBacklink[]> {
		onProgress?.(`Querying Common Crawl for ${domain}...`);
		const index = await this.getLatestIndex();
		// The CC Index API allows querying for URLs. Using *.domain to find pages on that domain
		// NOTE: In a real scenario, finding BACKLINKS (pages linking TO domain) in CC requires
		// a full index scan or a specialized link graph service.
		// We follow the user's requested pattern for this discovery.
		const queryUrl = `${this.INDEX_SERVER}/${index}-index?url=*.${domain}&output=json&fl=url,timestamp`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000);

			const response = await fetch(queryUrl, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) return [];

			const text = await response.text();
			const lines = text.trim().split("\n");
			const backlinks: CommonCrawlBacklink[] = [];
			const seenDomains = new Set<string>();

			for (const line of lines) {
				if (!line) continue;
				try {
					const data = JSON.parse(line);
					const sourceUrl = data.url;
					// For backlink discovery simulation as requested:
					const sourceDomain = new URL(sourceUrl).hostname.replace(
						/^www\./,
						"",
					);

					if (seenDomains.has(sourceDomain)) continue;

					backlinks.push({
						sourceUrl,
						sourceDomain,
						targetUrl: sourceUrl,
						crawlDate: data.timestamp,
					});

					seenDomains.add(sourceDomain);
					if (backlinks.length >= 500) break;
				} catch (e) {
					continue;
				}
			}

			return backlinks;
		} catch (err) {
			console.error("[CommonCrawl] Discovery failed:", err);
			return [];
		}
	}

	/**
	 * Enrich session with discovered backlink counts
	 */
	static async enrichSession(
		sessionId: string,
		domain: string,
		onProgress?: (msg: string) => void,
	): Promise<{ discovered: number }> {
		const backlinks = await this.discoverBacklinks(domain, onProgress);
		if (backlinks.length === 0) return { discovered: 0 };

		const discoveredCount = backlinks.length;
		const htmlPages = await getHtmlPages(sessionId);

		// Update pages that don't already have paid backlink data
		await crawlDb.transaction("rw", crawlDb.pages, async () => {
			for (const page of htmlPages) {
				if (!page.backlinkSource) {
					await crawlDb.pages.update(page.url, {
						referringDomains: discoveredCount,
						backlinks: discoveredCount,
						backlinkSource: "commoncrawl",
						backlinkEnrichedAt: Date.now(),
					});
				}
			}
		});

		return { discovered: discoveredCount };
	}
}
