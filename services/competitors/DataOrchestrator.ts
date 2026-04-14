import { CompetitorProfile } from '../CompetitorMatrixConfig';

export interface DataSourceConfig {
  name: string;
  scraper: (domain: string, fetchFn?: any) => Promise<Partial<CompetitorProfile>>;
  ratePerHour: number;
  cooldownMs: number;
  reliability: number;
  runsOn: 'server' | 'browser';
  fields: (keyof CompetitorProfile)[];
  requiresBusinessName?: boolean;
  requiresSocialUrl?: string;
}

const lastUsed = new Map<string, number>();

export function canUseSource(source: DataSourceConfig, domain: string): boolean {
  const key = `${source.name}:${domain}`;
  const last = lastUsed.get(key) || 0;
  return Date.now() - last >= source.cooldownMs;
}

export function markUsed(source: DataSourceConfig, domain: string): void {
  lastUsed.set(`${source.name}:${domain}`, Date.now());
}

export async function runSource(
  source: DataSourceConfig,
  domain: string,
  fetchFn?: (url: string) => Promise<string>,
  businessName?: string
): Promise<Partial<CompetitorProfile>> {
  if (!canUseSource(source, domain)) {
    console.log(`[Orchestrator] ${source.name} rate-limited for ${domain}, skipping`);
    return {};
  }

  markUsed(source, domain);

  try {
    if (source.requiresBusinessName) {
      return await (source.scraper as any)(businessName || domain, fetchFn);
    }
    if (source.requiresSocialUrl) {
      return await source.scraper(domain, fetchFn);
    }
    return await source.scraper(domain, fetchFn);
  } catch (err) {
    console.warn(`[Orchestrator] ${source.name} failed for ${domain}:`, err);
    return {};
  }
}

export function mergeInto(
  target: Partial<CompetitorProfile>,
  source: Partial<CompetitorProfile>,
  sourceName: string
): void {
  for (const [key, value] of Object.entries(source)) {
    if (key === '_meta' || key === 'domain') continue;
    if (value === null || value === undefined) continue;

    const existing = (target as any)[key];
    if (existing === null || existing === undefined) {
      (target as any)[key] = value;
    }
  }

  if (!target.dataSourcesUsed) target.dataSourcesUsed = [];
  if (!target.dataSourcesUsed.includes(sourceName)) {
    target.dataSourcesUsed.push(sourceName);
  }
}

export function averageEstimates(
  profile: Partial<CompetitorProfile>,
  field: keyof CompetitorProfile,
  estimates: Map<string, number>
): void {
  if (estimates.size === 0) return;
  const values = [...estimates.values()].filter((v) => v > 0);
  if (values.length === 0) return;
  (profile as any)[field] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
