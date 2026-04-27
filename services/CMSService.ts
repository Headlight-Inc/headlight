// services/CMSService.ts
export class CMSService {
    /**
     * Deep CMS metadata enrichment (WordPress/Shopify etc.)
     * This is a stub to resolve import errors in PostCrawlEnrichment.ts
     */
    static async enrichSession(sessionId: string, startUrl: string, onProgress?: (msg: string) => void) {
        onProgress?.('Checking CMS deep metadata...');
        return {
            cms: null,
            enriched: 0
        };
    }
}
