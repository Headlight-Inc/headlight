// packages/metrics/src/catalog.ts
import type { MetricDef } from '@headlight/types';

import { IDENTITY_METRICS } from './defs/p.identity';
import { INDEXING_METRICS } from './defs/p.indexing';
import { TECH_METRICS } from './defs/p.tech';
import { CONTENT_METRICS } from './defs/p.content';
import { LINKS_METRICS } from './defs/p.links';
import { UX_METRICS } from './defs/p.ux';
import { COMMERCE_METRICS } from './defs/p.commerce';
import { LOCAL_METRICS } from './defs/p.local';
import { SEARCH_METRICS } from './defs/p.search';

export const ALL_METRICS: MetricDef[] = [
	...IDENTITY_METRICS,
	...INDEXING_METRICS,
	...TECH_METRICS,
	...CONTENT_METRICS,
	...LINKS_METRICS,
	...UX_METRICS,
	...COMMERCE_METRICS,
	...LOCAL_METRICS,
	...SEARCH_METRICS,
];

const METRIC_MAP = new Map<string, MetricDef>(ALL_METRICS.map(m => [m.key, m]));

export function getMetricDef(key: string): MetricDef | undefined {
	return METRIC_MAP.get(key);
}

export function getMetricsByNamespace(ns: string): MetricDef[] {
	return ALL_METRICS.filter(m => m.namespace === ns || m.namespace.startsWith(ns + '.'));
}

export * from './visibility';
