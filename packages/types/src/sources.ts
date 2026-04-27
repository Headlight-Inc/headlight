export const SOURCE_TIERS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'] as const;

export type SourceTier = typeof SOURCE_TIERS[number];

export const SOURCE_TAGS = [
  'source',
  'browser',
  'scrape',
  'ai',
  'est',
  'default',
  'live',
  'recent',
  'fresh',
  'ok',
  'stale',
  'unknown',
  'lowN',
] as const;

export type SourceTag = typeof SOURCE_TAGS[number];

export interface SourceStamp {
  tier: SourceTier;
  tags: ReadonlyArray<SourceTag>;
  provider: string;
  observedAt: string;
  sampleSize?: number;
  confidence?: number;
}

export interface FpValue<T> {
  value: T;
  confidence: number;
  source: SourceStamp;
}

export const SOURCE_TIER_LABEL: Record<SourceTier, string> = {
  T0: 'Authoritative connection',
  T1: 'Browser-offload',
  T2: 'First-party API',
  T3: 'Third-party API',
  T4: 'Common Crawl',
  T5: 'SERP-derived',
  T6: 'AI-inferred',
  T7: 'Scrape',
  T8: 'Default',
};
