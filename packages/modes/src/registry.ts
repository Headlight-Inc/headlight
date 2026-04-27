import type { Industry, Mode } from '../../types/src';

export interface ModeView {
  id: string;
  kind: 'table' | 'dashboard' | 'graph' | 'timeline';
  label: string;
  shortcut?: string;
  badge?: 'count';
  requires?: string[];
  submodes?: { id: string; label: string }[];
}

export interface ModeDescriptor {
  id: Mode;
  label: string;
  accent: string;
  description: string;
  shortcut: string;
  defaultViewId: string;
  views: ModeView[];
  lsSections: { id: string; label: string; type: 'list' | 'facet' | 'saved-views' }[];
  rsTabs: { id: string; label: string }[];
}

export interface ColumnDefaults {
  visible: string[];
  order?: Record<string, number>;
}

const DEFS = new Map<Mode, ModeDescriptor>();
const COLUMN_DEFAULTS = new Map<Mode, ColumnDefaults>();

export const MODE_INDUSTRY_HINT: Record<Mode, ReadonlyArray<Industry>> = {
  fullAudit: ['general'],
  wqa: ['general'],
  technical: ['general'],
  content: ['blog', 'news', 'saas', 'healthcare'],
  linksAuthority: ['general'],
  uxConversion: ['general'],
  paid: ['general'],
  commerce: ['ecommerce'],
  socialBrand: ['general'],
  ai: ['general'],
  competitors: ['general'],
  local: ['local', 'restaurant'],
};

export function registerMode(d: ModeDescriptor) {
  if (DEFS.has(d.id)) throw new Error(`Mode already registered: ${d.id}`);
  DEFS.set(d.id, d);
}

export function registerModeColumnDefaults(mode: Mode, defaults: ColumnDefaults) {
  COLUMN_DEFAULTS.set(mode, defaults);
}

export function getMode(id: Mode): ModeDescriptor {
  const m = DEFS.get(id);
  if (!m) throw new Error(`Unknown mode: ${id}`);
  return m;
}

export function allModes(): ReadonlyArray<ModeDescriptor> {
  return [...DEFS.values()];
}

export function getColumnDefaults(mode: Mode): ColumnDefaults {
  return COLUMN_DEFAULTS.get(mode) ?? { visible: [] };
}

export function registerAllModes() {
  registerFullAuditMode();
  registerWqaMode();
  registerTechnicalMode();
  registerContentMode();
  registerLinksAuthorityMode();
  registerUxConversionMode();
  registerPaidMode();
  registerCommerceMode();
  registerSocialBrandMode();
  registerAiMode();
  registerCompetitorsMode();
  registerLocalMode();
}

import { registerAiMode } from './definitions/ai';
import { registerCommerceMode } from './definitions/commerce';
import { registerCompetitorsMode } from './definitions/competitors';
import { registerContentMode } from './definitions/content';
import { registerFullAuditMode } from './definitions/full-audit';
import { registerLinksAuthorityMode } from './definitions/links-authority';
import { registerLocalMode } from './definitions/local';
import { registerPaidMode } from './definitions/paid';
import { registerSocialBrandMode } from './definitions/social-brand';
import { registerTechnicalMode } from './definitions/technical';
import { registerUxConversionMode } from './definitions/ux-conversion';
import { registerWqaMode } from './definitions/wqa';
