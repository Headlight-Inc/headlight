/**
 * services/CompetitorMicroCrawl.ts
 *
 * A specialized crawler flow for competitors.
 * Runs a lightweight micro-crawl (10-30 pages), builds an aggregate profile,
 * optionally enriches with AI, and persists the result.
 */

import { GhostCrawler } from './GhostCrawler';
import { buildCompetitorCrawlPlan } from './CompetitorDiscoveryService';
import { CompetitorProfileBuilder } from './CompetitorProfileBuilder';
import { saveCompetitorProfile, saveCompetitorSnapshot, CrawledPage } from './CrawlDatabase';
import { persistCompetitorProfile } from './CrawlPersistenceService';
import { CompetitorProfile, createEmptyProfile } from './CompetitorMatrixConfig';
import { runPhaseF } from './competitors/CompetitorEnrichmentPipeline';

export interface MicroCrawlProgress {
  stage: 'starting' | 'crawling' | 'analyzing' | 'enriching_ai' | 'complete' | 'error';
  pagesCrawled: number;
  totalDiscovered: number;
  message: string;
}

export type MicroCrawlProgressCallback = (progress: MicroCrawlProgress) => void;

export async function runCompetitorMicroCrawl(
  competitorUrl: string,
  projectId: string,
  options?: {
    maxPages?: number;
    aiEnrich?: boolean;
    aiComplete?: (opts: { prompt: string; format: string; maxTokens?: number }) => Promise<{ text: string }>;
    onProgress?: MicroCrawlProgressCallback;
  }
): Promise<CompetitorProfile> {
  const onProgress = options?.onProgress || (() => {});
  
  try {
    // 1. Normalize URL
    let url = competitorUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // 2. Extract domain
    const domain = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    
    onProgress({ stage: 'starting', pagesCrawled: 0, totalDiscovered: 0, message: `Starting crawl for ${domain}...` });

    const instantProfile = await CompetitorProfileBuilder.instantEnrich(domain);

    // 3. Build crawl plan
    const basePlan = buildCompetitorCrawlPlan(url);
    const ghost = new GhostCrawler({
      ...basePlan,
      limit: options?.maxPages || 30,
      maxDepth: 2
    });

    const pages: CrawledPage[] = [];
    
    // 4. Setup listeners
    ghost.on('page', (page: CrawledPage) => {
      pages.push(page);
    });

    ghost.on('progress', (p: any) => {
      onProgress({
        stage: 'crawling',
        pagesCrawled: p.crawled,
        totalDiscovered: p.discovered,
        message: `Crawled ${p.crawled} pages (${p.discovered} discovered)...`
      });
    });

    // 5. Run crawl
    const sessionId = `comp_${Date.now()}_${domain.replace(/\./g, '_')}`;
    await ghost.start(url, sessionId);

    // Wait for completion (ghost.start doesn't return a promise that waits for completion, 
    // it schedules the run. We need to wait for the 'complete' event).
    // Actually, checking GhostCrawler.ts, start() calls scheduleRun() which is async but doesn't wait.
    await new Promise<void>((resolve, reject) => {
      ghost.on('complete', () => resolve());
      ghost.on('error', (err: any) => reject(err));
      
      // Safety timeout
      setTimeout(() => reject(new Error('Crawl timed out')), 60000);
    });

    onProgress({ stage: 'analyzing', pagesCrawled: pages.length, totalDiscovered: pages.length, message: 'Building competitive profile...' });

    // Build from crawl data
    const crawlProfile = CompetitorProfileBuilder.fromCrawlPages(domain, pages);

    // AI-enrich if enabled
    let aiProfile: Partial<CompetitorProfile> = {};
    if (options?.aiEnrich !== false && options?.aiComplete) {
      const homepage = pages.find(p => p.crawlDepth === 0) || pages[0];
      // Fallback: use title/desc if textContent is missing (since GhostCrawler doesn't store it by default)
      const textToAnalyze = (homepage as any).textContent || `${homepage.title} ${homepage.metaDesc} ${homepage.h1_1}`;
      
      if (textToAnalyze) {
        onProgress({ stage: 'enriching_ai', pagesCrawled: pages.length, totalDiscovered: pages.length, message: 'AI analyzing competitor...' });
        aiProfile = await CompetitorProfileBuilder.fromAiAnalysis(
          domain, 
          textToAnalyze, 
          options.aiComplete
        );
      }
    }

    // Merge and persist
    const merged = CompetitorProfileBuilder.merge(
      createEmptyProfile(domain),
      instantProfile,
      crawlProfile,
      aiProfile
    );
    runPhaseF({ domain, profile: merged });
    merged._meta.source = 'enriched';
    const profile = merged;

    await saveCompetitorProfile(projectId, profile);
    
    // Cloud sync (non-blocking)
    persistCompetitorProfile(projectId, profile).catch(err =>
      console.warn('[CompetitorMicroCrawl] Cloud sync failed:', err)
    );

    // Save history snapshot
    saveCompetitorSnapshot(projectId, profile).catch(console.warn);

    onProgress({ stage: 'complete', pagesCrawled: pages.length, totalDiscovered: pages.length, message: `Profile complete for ${domain}` });

    return profile;

  } catch (err: any) {
    onProgress({ stage: 'error', pagesCrawled: 0, totalDiscovered: 0, message: `Error: ${err.message}` });
    throw err;
  }
}
