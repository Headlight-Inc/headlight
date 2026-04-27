import type { CmsKey } from './cms';
import type { Industry } from './industries';
import type { Mode } from './modes';
import type { MetricRole } from './roles';
import type { SourceTier } from './sources';

export type MetricLevel = 'P' | 'S' | 'K' | 'Q' | 'L' | 'E' | 'B' | 'U';

export type IntegrationId =
  | 'gsc' | 'ga4' | 'gbp' | 'semrush' | 'ahrefs' | 'moz' | 'bing'
  | 'stripe' | 'shopify' | 'hubspot' | 'salesforce' | 'ads' | 'meta'
  | 'linkedin' | 'tiktok' | 'youtube' | 'clarity' | 'hotjar' | 'posthog'
  | 'klaviyo' | 'mailchimp';

export type Capability =
  | 'cms.wordpress' | 'cms.webflow' | 'cms.shopify' | 'cms.ghost'
  | 'cms.contentful' | 'cms.sanity' | 'cms.any'
  | 'ads' | 'gbp' | 'gsc' | 'ga4'
  | 'semrush' | 'ahrefs' | 'moz' | 'bing';

export interface MetricGate {
  modes?: Mode[];
  industries?: Industry[];
  excludeIndustries?: Industry[];
  cms?: CmsKey[];
  languages?: string[];
  stack?: string[];
  minUrls?: number;
  requireConnected?: IntegrationId[];
  requireCapability?: Capability[];
  custom?: string;
}

export interface MetricDef {
  key: string;
  namespace: string;
  level: MetricLevel;
  roles: MetricRole[];
  sources: SourceTier[];
  unit?: string;
  format?: 'number' | 'percent' | 'duration' | 'bytes' | 'date' | 'enum' | 'text' | 'score' | 'money' | 'boolean';
  i18nLabelKey: string;
  gate?: MetricGate;
  description?: string;
  deprecated?: boolean;
  scoreComponent?: string;
  actionKeys?: string[];
  fallbackKey?: string;
  tags?: string[];
}
