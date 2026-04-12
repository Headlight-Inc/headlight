import {
    crawlDb,
    getHtmlPages,
    type CrawledPage
} from './CrawlDatabase';
import { UrlNormalization } from './UrlNormalization';

export interface BingTrafficMetrics {
    bingClicks: number;
    bingImpressions: number;
    bingPosition: number;
    bingCtr: number;
}

export interface BingCrawlError {
    url: string;
    errorCode: string;
    date: string;
    detail: string;
}

export interface BingKeywordRow {
    query: string;
    impressions: number;
    clicks: number;
    position: number;
    ctr: number;
    date: string;
}

export class BingWebmasterService {
    private static API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

    /**
     * Helper to fetch from Bing Webmaster API
     */
    private static async fetchBing(method: string, params: Record<string, string>, accessToken: string): Promise<any> {
        const queryParams = new URLSearchParams(params);
        // Note: Bing API expects apikey either in query or Auth header. Using Auth header as standard OAuth.
        
        const response = await fetch(`${this.API_BASE}/${method}?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Bing API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        return data.d; // Bing API typically wraps response in "d" property
    }

    /**
     * 1. getSiteList: Fetch verified site URLs
     */
    static async getSiteList(accessToken: string): Promise<string[]> {
        const data = await this.fetchBing('GetUserSites', {}, accessToken);
        return (data || []).map((site: any) => site.Url);
    }

    /**
     * 2. getUrlTrafficInfo: Fetch last 30 days of URL-level data
     */
    static async getUrlTrafficInfo(siteUrl: string, accessToken: string, onProgress?: (msg: string) => void): Promise<Record<string, BingTrafficMetrics>> {
        onProgress?.('Fetching Bing URL traffic stats...');
        // GET /GetPageStats?siteUrl={siteUrl}
        const data = await this.fetchBing('GetPageStats', { siteUrl }, accessToken);
        
        const metrics: Record<string, BingTrafficMetrics> = {};
        (data || []).forEach((item: any) => {
            metrics[item.Url] = {
                bingClicks: item.Clicks || 0,
                bingImpressions: item.Impressions || 0,
                bingPosition: item.AvgPosition || 0,
                bingCtr: item.Ctr || 0
            };
        });
        return metrics;
    }

    /**
     * 3. getCrawlErrors: Fetch crawl issues for the site
     */
    static async getCrawlErrors(siteUrl: string, accessToken: string): Promise<BingCrawlError[]> {
        const data = await this.fetchBing('GetCrawlIssues', { siteUrl }, accessToken);
        return (data || []).map((item: any) => ({
            url: item.Url,
            errorCode: item.ErrorCode,
            date: item.Date,
            detail: item.Detail
        }));
    }

    /**
     * 4. getKeywordData: Fetch query-level stats
     */
    static async getKeywordData(siteUrl: string, accessToken: string): Promise<BingKeywordRow[]> {
        const data = await this.fetchBing('GetQueryStats', { siteUrl }, accessToken);
        return (data || []).map((item: any) => ({
            query: item.Query,
            impressions: item.Impressions,
            clicks: item.Clicks,
            position: item.AvgPosition,
            ctr: item.Ctr,
            date: item.Date
        }));
    }

    /**
     * 5. enrichSession: Main entry point for post-crawl enrichment
     */
    static async enrichSession(
        sessionId: string, 
        siteUrl: string, 
        accessToken: string, 
        onProgress?: (msg: string) => void, 
        options: { targetUrls?: string[] } = {}
    ): Promise<{ enriched: number; total: number }> {
        const htmlPages = await getHtmlPages(sessionId);
        const targetPages = options.targetUrls 
            ? htmlPages.filter(p => options.targetUrls!.includes(p.url))
            : htmlPages;

        if (targetPages.length === 0) return { enriched: 0, total: 0 };

        try {
            // Fetch traffic data
            const trafficData = await this.getUrlTrafficInfo(siteUrl, accessToken, onProgress);
            
            // Fetch crawl errors to count them per URL
            onProgress?.('Fetching Bing Crawl Issues...');
            const crawlErrors = await this.getCrawlErrors(siteUrl, accessToken);
            const errorCountMap = new Map<string, number>();
            crawlErrors.forEach(err => {
                const canon = UrlNormalization.toCanonical(err.url);
                errorCountMap.set(canon, (errorCountMap.get(canon) || 0) + 1);
            });

            // Map Bing traffic data by canonical URL
            const bingCanonicalMap = new Map<string, BingTrafficMetrics>();
            Object.entries(trafficData).forEach(([url, metrics]) => {
                bingCanonicalMap.set(UrlNormalization.toCanonical(url), metrics);
            });

            let enrichedCount = 0;
            const updates: Array<{ url: string } & Partial<CrawledPage>> = [];

            for (const page of targetPages) {
                const canonical = UrlNormalization.toCanonical(page.url);
                const traffic = bingCanonicalMap.get(canonical);
                const errors = errorCountMap.get(canonical) || 0;

                if (traffic || errors > 0) {
                    enrichedCount++;
                    updates.push({
                        url: page.url,
                        bingClicks: traffic?.bingClicks ?? 0,
                        bingImpressions: traffic?.bingImpressions ?? 0,
                        bingPosition: traffic?.bingPosition ?? null,
                        bingCtr: traffic?.bingCtr ?? 0,
                        bingCrawlErrors: errors,
                        bingEnrichedAt: Date.now()
                    });
                }
            }

            if (updates.length > 0) {
                await crawlDb.transaction('rw', crawlDb.pages, async () => {
                    for (const update of updates) {
                        await crawlDb.pages.update(update.url, update);
                    }
                });
            }

            return { enriched: enrichedCount, total: targetPages.length };
        } catch (err: any) {
            console.error('[Bing Service] Enrichment failed:', err);
            onProgress?.(`Bing Error: ${err.message || 'Unknown error'}`);
            throw err;
        }
    }
}
