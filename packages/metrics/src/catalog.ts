import type { MetricDef } from '../../types/src';
import { pageMetrics } from './defs/page-defs';
import { siteMetrics } from './defs/site-defs';
import { keywordMetrics } from './defs/keyword-defs';
import { queryMetrics } from './defs/query-defs';
import { linkMetrics } from './defs/link-defs';
import { entityMetrics } from './defs/entity-defs';
import { backgroundMetrics } from './defs/background-defs';
import { userMetrics } from './defs/user-defs';
import { fingerprintMetrics } from './defs/fingerprint-defs';
import { MetricRegistry } from './registry';

export function buildCatalog(): ReadonlyArray<MetricDef> {
  return Object.freeze([
    ...pageMetrics,
    ...siteMetrics,
    ...keywordMetrics,
    ...queryMetrics,
    ...linkMetrics,
    ...entityMetrics,
    ...backgroundMetrics,
    ...userMetrics,
    ...fingerprintMetrics,
  ]);
}

export function initCatalog() {
  MetricRegistry.init(buildCatalog());
}
