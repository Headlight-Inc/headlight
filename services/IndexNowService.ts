const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',          // IndexNow hub
  'https://www.bing.com/indexnow',              // Bing
  'https://yandex.com/indexnow',                // Yandex  
  'https://searchadvisor.naver.com/indexnow',   // Naver
];

export interface IndexNowConfig {
  apiKey: string;           // User's IndexNow API key
  keyLocation?: string;     // URL where key file is hosted
  host: string;             // Site hostname
}

export async function submitToIndexNow(
  config: IndexNowConfig,
  urls: string[],
  onProgress?: (msg: string) => void
): Promise<{ submitted: number; failed: number; results: Array<{endpoint: string, status: number}> }> {
  if (!config.apiKey || urls.length === 0) return { submitted: 0, failed: 0, results: [] };
  
  // IndexNow accepts up to 10,000 URLs per request
  const batch = urls.slice(0, 10000);
  const results: Array<{endpoint: string, status: number}> = [];
  let submitted = 0;
  let failed = 0;
  
  const body = JSON.stringify({
    host: config.host,
    key: config.apiKey,
    keyLocation: config.keyLocation || `https://${config.host}/${config.apiKey}.txt`,
    urlList: batch,
  });

  // Submit to all endpoints in parallel
  const promises = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
    try {
      onProgress?.(`Submitting ${batch.length} URLs to ${new URL(endpoint).hostname}...`);
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      results.push({ endpoint, status: resp.status });
      if (resp.ok || resp.status === 202) {
        submitted++;
      } else {
        failed++;
      }
    } catch (err) {
      results.push({ endpoint, status: 0 });
      failed++;
    }
  });

  await Promise.all(promises);
  onProgress?.(`IndexNow: ${submitted} endpoints accepted, ${failed} failed`);
  
  return { submitted, failed, results };
}

// Auto-submit fixed pages after a crawl comparison
export async function submitFixedPages(
  config: IndexNowConfig,
  currentSessionId: string,
  previousSessionId: string,
  onProgress?: (msg: string) => void
): Promise<{ submitted: number }> {
  // We need crawlDb to fetch pages
  const { crawlDb } = await import('./CrawlDatabase');
  
  // Get pages that were broken/issues in previous crawl but fixed now
  const currentPages = await crawlDb.pages.where('crawlId').equals(currentSessionId).toArray();
  const previousPages = await crawlDb.pages.where('crawlId').equals(previousSessionId).toArray();
  
  const prevMap = new Map(previousPages.map(p => [p.url, p]));
  const fixedUrls: string[] = [];
  
  for (const page of currentPages) {
    const prev = prevMap.get(page.url);
    if (!prev) continue;
    
    // Page was broken, now fixed
    if (prev.statusCode >= 400 && page.statusCode === 200) {
      fixedUrls.push(page.url);
    } else if (!prev.metaDesc && page.metaDesc) {
      // Page had no meta, now has meta
      fixedUrls.push(page.url);
    } else if (prev.hash && page.hash && prev.hash !== page.hash) {
      // Content was updated (hash changed)
      fixedUrls.push(page.url);
    }
  }
  
  if (fixedUrls.length === 0) return { submitted: 0 };
  
  const uniqueUrls = [...new Set(fixedUrls)];
  onProgress?.(`Found ${uniqueUrls.length} fixed/updated pages to submit to IndexNow`);
  
  const result = await submitToIndexNow(config, uniqueUrls, onProgress);
  return { submitted: result.submitted > 0 ? uniqueUrls.length : 0 };
}
