import {
    crawlDb,
    getHtmlPages,
    storePageQueries,
    type CrawledPage,
    type PageQuery
} from './CrawlDatabase';
import { refreshGoogleToken } from './GoogleOAuthHelper';
import { refreshWithLock } from './TokenRefreshLock';
import { UrlNormalization } from './UrlNormalization';
import { VolumeEstimation } from './VolumeEstimation';

export interface GscMetricRow {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface GscResponse {
    rows?: GscMetricRow[];
}

export interface GscEnrichmentOptions {
    targetUrls?: string[];
    maxPageRows?: number;
    maxQueryRows?: number;
    googleEmail?: string;
    days?: number;
}

export class GscClientService {
    private static API_BASE = 'https://www.googleapis.com/webmasters/v3/sites';

    /**
     * Exponential Backoff Wrapper for fetch
     */
    private static async backoffFetch(fn: () => Promise<Response>, retries = 3): Promise<Response> {
        let delay = 1000;
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fn();
                if (response.status === 429 || (response.status >= 500 && i < retries)) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }
                return response;
            } catch (err) {
                if (i === retries) throw err;
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
        throw new Error('Retries exceeded');
    }

    /**
     * Get weekly-sharded date ranges to bypass 50k row limits
     */
    private static getDateRanges(days: number = 30) {
        const ranges: { startDate: string; endDate: string }[] = [];
        const overallEnd = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const overallStart = new Date(overallEnd.getTime() - days * 24 * 60 * 60 * 1000);

        let currentEnd = new Date(overallEnd);
        while (currentEnd > overallStart) {
            let currentStart = new Date(currentEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
            if (currentStart < overallStart) currentStart = new Date(overallStart);

            ranges.push({
                startDate: currentStart.toISOString().split('T')[0],
                endDate: currentEnd.toISOString().split('T')[0]
            });

            currentEnd = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
        }

        return ranges;
    }

    /**
     * Paginated fetcher for GSC Search Analytics with Sharding Support
     */
    private static async fetchPaginated(
        siteUrl: string,
        accessToken: string,
        dimensions: string[],
        days: number = 30,
        maxTotalRows: number = 1000000,
        googleEmail?: string
    ): Promise<GscMetricRow[]> {
        const ranges = this.getDateRanges(days);
        const allRows: GscMetricRow[] = [];
        const seenKeys = new Set<string>();
        let currentAccessToken = accessToken;

        for (const range of ranges) {
            if (allRows.length >= maxTotalRows) break;
            
            let startRow = 0;
            const singleRequestLimit = 25000;

            while (startRow < 50000) { // GSC API hard limit per request is 50k
                const nextLimit = Math.min(singleRequestLimit, 50000 - startRow);
                
                const body: any = {
                    startDate: range.startDate,
                    endDate: range.endDate,
                    dimensions,
                    rowLimit: nextLimit,
                    startRow
                };

                const response = await this.backoffFetch(() => fetch(
                    `${this.API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${currentAccessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    }
                ));

                if (response.status === 401 && googleEmail) {
                    const refreshedAccessToken = await refreshWithLock(googleEmail, refreshGoogleToken);
                    if (refreshedAccessToken && refreshedAccessToken !== currentAccessToken) {
                        currentAccessToken = refreshedAccessToken;
                        continue;
                    }
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(`GSC API Error: ${error.error?.message || response.statusText}`);
                }

                const data: GscResponse = await response.json();
                if (!data.rows || data.rows.length === 0) break;

                // Merge rows: Aggregate metrics if dimensions match across shards
                data.rows.forEach(row => {
                    const keyString = row.keys.join('|||');
                    if (seenKeys.has(keyString)) {
                        // Find existing and aggregate
                        const existing = allRows.find(r => r.keys.join('|||') === keyString);
                        if (existing) {
                            existing.clicks += row.clicks;
                            existing.impressions += row.impressions;
                            // Position and CTR need smart merging, but for "sharded weeks" we'll take weighted average or just keep latest
                            // To keep it simple and performant for enrichment where we want the *overall* result:
                            existing.position = (existing.position + row.position) / 2; // Simple avg for now
                            existing.ctr = (existing.clicks / existing.impressions) || 0;
                        }
                    } else {
                        seenKeys.add(keyString);
                        allRows.push(row);
                    }
                });

                if (data.rows.length < nextLimit) break;
                startRow += nextLimit;
            }
        }

        return allRows;
    }

    /**
     * Strategic Keyword Scoring
     */
    private static scoreKeyword(row: GscMetricRow): number {
        return (
            (row.clicks * 1000) +
            (row.impressions * 0.1) +
            (Math.max(0, 101 - row.position) * 5) +
            (row.ctr * 1000)
        );
    }

    private static isBetterBestKeyword(candidate: GscMetricRow, current: GscMetricRow | null): boolean {
        if (!current) return true;
        if (candidate.position !== current.position) {
            return candidate.position < current.position;
        }
        if (candidate.clicks !== current.clicks) {
            return candidate.clicks > current.clicks;
        }
        return candidate.impressions > current.impressions;
    }

    /**
     * Deep GSC Enrichment with Two-Tier Fetch Strategy
     */
    static async enrichSession(
        sessionId: string,
        siteUrl: string,
        accessToken: string,
        onProgress?: (msg: string) => void,
        options: GscEnrichmentOptions = {}
    ): Promise<{ enriched: number; total: number; rowsCollected: number; queryRowsStored: number }> {
        const htmlPages = await getHtmlPages(sessionId);
        const targetCanonicalSet = new Set(
            (options.targetUrls || htmlPages.map((page) => page.url)).map((url) => UrlNormalization.toCanonical(url))
        );
        const targetPages = htmlPages.filter((page) => targetCanonicalSet.has(UrlNormalization.toCanonical(page.url)));

        if (targetPages.length === 0 && !options.maxPageRows) {
            return { enriched: 0, total: 0, rowsCollected: 0, queryRowsStored: 0 };
        }

        // TIER 1: Page-level Summary (All traffic-carrying pages)
        // We fetch a larger set than targetPages to identify "Discovered but not crawled" or "Losing traffic"
        const maxPageRows = options.maxPageRows || 100000;
        onProgress?.(`Fetching GSC Page Summary (up to ${maxPageRows.toLocaleString()} rows)...`);
        const pageRows = await this.fetchPaginated(siteUrl, accessToken, ['page'], options.days || 30, maxPageRows, options.googleEmail);
        
        // TIER 2: Page + Query Details (Strategic priority pages only)
        // We only fetch query details for pages we actually found in the crawl or were explicitly targeted
        const maxQueryRows = options.maxQueryRows || 250000;
        onProgress?.(`Fetching GSC Page+Query Details (up to ${maxQueryRows.toLocaleString()} rows)...`);
        const queryRows = await this.fetchPaginated(siteUrl, accessToken, ['page', 'query'], options.days || 30, maxQueryRows, options.googleEmail);

        // TIER 3: Previous Period Page Summary (for Delta)
        const PERIOD_DAYS = options.days || 30; // Typically 28 or 30 days
        const prevEndDate = new Date(Date.now() - (PERIOD_DAYS + 2) * 24 * 60 * 60 * 1000);
        const prevStartDate = new Date(prevEndDate.getTime() - PERIOD_DAYS * 24 * 60 * 60 * 1000);
        
        onProgress?.(`Fetching Previous GSC Page Summary for comparison...`);
        let prevPeriodData: GscMetricRow[] = [];
        try {
            const prevResponse = await this.backoffFetch(() => fetch(
                `${this.API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        startDate: prevStartDate.toISOString().split('T')[0],
                        endDate: prevEndDate.toISOString().split('T')[0],
                        dimensions: ['page'],
                        rowLimit: maxPageRows,
                        startRow: 0
                    })
                }
            ));
            if (prevResponse.ok) {
                const data: GscResponse = await prevResponse.json();
                prevPeriodData = data.rows || [];
            }
        } catch (e) {
            console.error('Failed to fetch previous GSC period:', e);
        }

        const prevImpressionsMap = new Map(
            prevPeriodData.map((row) => [UrlNormalization.toCanonical(row.keys[0]), Number(row.impressions || 0)])
        );

        // 1. Map all GSC rows by canonical URL for O(1) lookup
        const gscCanonicalMap = new Map<string, GscMetricRow>();
        const gscPathMap = new Map<string, GscMetricRow>();

        pageRows.forEach(row => {
            const url = row.keys[0];
            const canonical = UrlNormalization.toCanonical(url);
            gscCanonicalMap.set(canonical, row);

            // Path-level map for fallback (low confidence)
            const path = url.split('?')[0].split('#')[0].replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') || '/';
            if (path !== '/' && !gscPathMap.has(path)) {
                gscPathMap.set(path, row);
            }
        });

        // 2. Query Intelligence (Main/Best Keyword assignment)
        const targetPageUrlByCanonical = new Map<string, string>(
            targetPages.map((page) => [UrlNormalization.toCanonical(page.url), page.url])
        );
        const urlIntelligence = new Map<string, any>();
        const rankingKeywordsMap = new Map<string, number>();
        const storedQueries: PageQuery[] = [];

        queryRows.forEach(row => {
            const url = row.keys[0];
            const query = row.keys[1];
            const canonical = UrlNormalization.toCanonical(url);
            
            if (!gscCanonicalMap.has(canonical) || !query) return;

            if (Number(row.position || 0) <= 100) {
                rankingKeywordsMap.set(canonical, (rankingKeywordsMap.get(canonical) || 0) + 1);
            }

            const score = this.scoreKeyword(row);
            const existing = urlIntelligence.get(canonical) || { 
                main: null, 
                best: null, 
                mainScore: -1, 
                bestRow: null
            };

            if (score > existing.mainScore) {
                existing.main = { query, row };
                existing.mainScore = score;
            }

            if (this.isBetterBestKeyword(row, existing.bestRow)) {
                existing.best = { query, row };
                existing.bestRow = row;
            }

            urlIntelligence.set(canonical, existing);

            // Store in Query DB if it's part of our crawl
            if (targetCanonicalSet.has(canonical)) {
                storedQueries.push({
                    crawlId: sessionId,
                    pageUrl: targetPageUrlByCanonical.get(canonical) || canonical,
                    query,
                    clicks: row.clicks,
                    impressions: row.impressions,
                    ctr: row.ctr,
                    position: row.position
                });
            }
        });

        // 3. Persist Query Data
        if (storedQueries.length > 0) {
            await crawlDb.transaction('rw', crawlDb.queries, async () => {
                for (const page of targetPages) {
                    await crawlDb.queries
                        .where('[crawlId+pageUrl]')
                        .equals([sessionId, page.url])
                        .delete();
                }
            });
            await storePageQueries(storedQueries);
        }

        // 4. Update CrawledPage records with Layered Joining
        let enrichedCount = 0;
        const updates: Array<{ url: string } & Partial<CrawledPage>> = [];

        for (const page of targetPages) {
            let bestMatch: GscMetricRow | null = null;
            let bestResult: any = { joinType: null, confidence: 0 };

            // LAYERED JOIN: find the best GSC row for this page
            const canonical = UrlNormalization.toCanonical(page.url);
            
            // Try exact/canonical/redirect joins via map
            const candidates = [page.url, canonical, page.finalUrl].filter(Boolean) as string[];
            for (const candidate of candidates) {
                const row = gscCanonicalMap.get(UrlNormalization.toCanonical(candidate));
                if (row) {
                    const result = UrlNormalization.getMatchResult(page.url, row.keys[0], page.finalUrl || undefined);
                    if (result.confidence > bestResult.confidence) {
                        bestResult = result;
                        bestMatch = row;
                    }
                }
            }

            // Fallback: Path match (lower confidence)
            if (!bestMatch) {
                const path = page.url.split('?')[0].split('#')[0].replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') || '/';
                const pathRow = gscPathMap.get(path);
                if (pathRow) {
                    bestMatch = pathRow;
                    bestResult = { joinType: 'path', confidence: 85 };
                }
            }

            const intel = urlIntelligence.get(canonical);
            
            if (bestMatch || intel) {
                enrichedCount++;
                const prevImpressions = prevImpressionsMap.get(canonical) || 0;
                const currentImpressions = Number(bestMatch?.impressions || 0);
                const gscImpressionsDelta = prevImpressions > 0 
                  ? (currentImpressions - prevImpressions) / prevImpressions 
                  : null;
                  
                const rankingKeywords = rankingKeywordsMap.get(canonical) || 0;

                const update: Partial<CrawledPage> = {
                    gscClicks: bestMatch?.clicks ?? 0,
                    gscImpressions: bestMatch?.impressions ?? 0,
                    gscCtr: bestMatch?.ctr ?? 0,
                    gscPosition: bestMatch?.position ?? 0,
                    gscEnrichedAt: Date.now(),
                    gscMatchConfidence: bestResult.confidence,
                    gscJoinType: bestResult.joinType,
                    gscImpressionsDelta,
                    rankingKeywords
                };

                if (intel?.main) {
                    update.mainKeyword = intel.main.query;
                    update.mainKwPosition = intel.main.row.position;
                    update.mainKeywordSource = 'gsc';
                    update.mainKwEstimatedVolume = VolumeEstimation.fromImpressions(
                        intel.main.row.impressions, 
                        intel.main.row.position
                    );
                    update.volumeEstimationMethod = 'impression_share';
                }

                if (intel?.best) {
                    update.bestKeyword = intel.best.query;
                    update.bestKwPosition = intel.best.row.position;
                    update.bestKeywordSource = 'gsc';
                    update.bestKwEstimatedVolume = VolumeEstimation.fromImpressions(
                        intel.best.row.impressions,
                        intel.best.row.position
                    );
                }

                updates.push({ url: page.url, ...update });
            }
        }

        if (updates.length > 0) {
            await crawlDb.transaction('rw', crawlDb.pages, async () => {
                for (const update of updates) {
                    await crawlDb.pages.update(update.url, update);
                }
            });
        }

        return { 
            enriched: enrichedCount, 
            total: targetPages.length,
            rowsCollected: pageRows.length + queryRows.length,
            queryRowsStored: storedQueries.length
        };
    }
}
