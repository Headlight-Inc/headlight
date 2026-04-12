import {
    crawlDb,
    getHtmlPages,
    type CrawledPage
} from './CrawlDatabase';
import { UrlNormalization } from './UrlNormalization';

export interface WpPageMetadata {
    url: string;
    wpPostType: string;
    wpCategories: string[];
    wpTags: string[];
    wpAuthor: string;
    wpPublishDate: string;
    wpModifiedDate: string;
    wpSlug: string;
    wpFeaturedImage: string;
}

export class WordPressService {
    /**
     * Check if a site has the WordPress REST API enabled
     */
    static async isWordPressSite(siteUrl: string): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${siteUrl}/wp-json/`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) return false;
            const data = await response.json();
            return !!data.name;
        } catch {
            return false;
        }
    }

    /**
     * Fetch public posts and pages metadata via REST API
     */
    static async fetchWpMetadata(siteUrl: string, onProgress?: (msg: string) => void): Promise<WpPageMetadata[]> {
        onProgress?.('Fetching WordPress metadata...');
        const allMetadata: WpPageMetadata[] = [];
        const endpoints = ['posts', 'pages'];

        for (const endpoint of endpoints) {
            try {
                // Fetch up to 500 total rows across posts and pages
                for (let pageNum = 1; pageNum <= 5; pageNum++) {
                    const response = await fetch(`${siteUrl}/wp-json/wp/v2/${endpoint}?per_page=100&page=${pageNum}`);
                    if (!response.ok) break;
                    
                    const data = await response.json();
                    if (!Array.isArray(data) || data.length === 0) break;

                    data.forEach((item: any) => {
                        allMetadata.push({
                            url: item.link,
                            wpPostType: item.type,
                            wpCategories: item.categories || [],
                            wpTags: item.tags || [],
                            wpAuthor: String(item.author),
                            wpPublishDate: item.date_gmt || item.date,
                            wpModifiedDate: item.modified_gmt || item.modified,
                            wpSlug: item.slug,
                            wpFeaturedImage: String(item.featured_media || '')
                        });
                    });
                    
                    if (allMetadata.length >= 500) break;
                }
            } catch (err) {
                console.error(`[WordPress] Failed to fetch ${endpoint}:`, err);
            }
            if (allMetadata.length >= 500) break;
        }

        return allMetadata;
    }

    /**
     * Enrich crawl results with WordPress metadata
     */
    static async enrichSession(sessionId: string, siteUrl: string, onProgress?: (msg: string) => void): Promise<{ enriched: number }> {
        // Step 1: Detect WP
        const isWP = await this.isWordPressSite(siteUrl);
        if (!isWP) return { enriched: 0 };

        // Step 2: Fetch Metadata
        const metadata = await this.fetchWpMetadata(siteUrl, onProgress);
        if (metadata.length === 0) return { enriched: 0 };

        // Step 3: Match and Update
        const htmlPages = await getHtmlPages(sessionId);
        const wpMap = new Map<string, WpPageMetadata>();
        metadata.forEach(m => {
            wpMap.set(UrlNormalization.toCanonical(m.url), m);
        });

        let enrichedCount = 0;
        const updates: Array<{ url: string } & Partial<CrawledPage>> = [];

        for (const page of htmlPages) {
            const meta = wpMap.get(UrlNormalization.toCanonical(page.url));
            if (meta) {
                enrichedCount++;
                updates.push({
                    url: page.url,
                    cmsType: 'wordpress',
                    wpPostType: meta.wpPostType,
                    wpCategories: meta.wpCategories.map(String),
                    wpTags: meta.wpTags.map(String),
                    wpAuthor: meta.wpAuthor,
                    wpPublishDate: meta.wpPublishDate,
                    wpModifiedDate: meta.wpModifiedDate
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

        return { enriched: enrichedCount };
    }
}
