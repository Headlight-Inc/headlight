// shared/source/types.ts
export type RsSourceTier =
  | 'authoritative'   // GSC, GA4, Ads, GBP, Salesforce
  | 'free-api'        // PSI, public Wayback, schema.org
  | 'scrape'          // crawler-extracted from the page
  | 'ai'              // model inference
  | 'est'             // computed estimate (e.g. percentile)
  | 'default'         // hard-coded fallback (must be transparent)

export interface RsSource {
  tier: RsSourceTier
  name: string         // 'Search Console', 'PSI', 'Crawler', 'Heuristic', etc.
  fetchedAt?: number   // ms since epoch
}
